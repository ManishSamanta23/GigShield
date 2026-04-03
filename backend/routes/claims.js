const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { protect } = require('../middleware/auth');
const { z } = require('zod');
const { validateClaimAgainstRealData } = require('../utils/autoApprovalEngine');

const claimSchema = z.object({
  triggerType: z.string({ required_error: 'Trigger type is required' }).min(1, 'Trigger type is required'),
  triggerValue: z.any().optional(), // For reference only - NOT used for auto-approval
  hoursLost: z.coerce.number().positive('Hours lost must be greater than 0').max(24, 'Hours lost cannot exceed 24'),
  latitude: z.coerce.number().optional(), // Geolocation for API validation
  longitude: z.coerce.number().optional() // Geolocation for API validation
});

// Payout formula
const calculatePayout = (hoursLost, avgDailyHours, avgDailyEarnings, plan) => {
  const ratios = { Basic: 0.5, Pro: 0.75, Max: 1.0 };
  const ratio = ratios[plan] || 0.75;
  return Math.round((hoursLost / avgDailyHours) * avgDailyEarnings * ratio);
};

// Simple fraud score calculation
const getFraudScore = (worker, triggerType, hoursLost) => {
  let score = 0;
  if (hoursLost > 12) score += 0.4;
  if (hoursLost > 8) score += 0.2;
  return Math.min(score, 1.0);
};

const AUTO_APPROVABLE_TRIGGERS = ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Cyclone', 'Air Pollution'];


// @route POST /api/claims
// @desc Submit a new claim with real-time data validation
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const parsed = claimSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    
    const { triggerType, triggerValue, hoursLost, latitude, longitude } = parsed.data;
    
    // Get the worker's active policy
    const policy = await Policy.findOne({ worker: req.worker._id, status: 'Active' });
    if (!policy) return res.status(400).json({ message: 'No active policy found' });

    // Check if this trigger type is covered by the policy
    if (!policy.coverageEvents.includes(triggerType))
      return res.status(400).json({ message: 'This trigger is not covered by your plan' });

    // Calculate payout based on worker's earnings and policy
    const avgDailyEarnings = req.worker.avgWeeklyEarnings / 7;
    const payoutAmount = Math.min(
      calculatePayout(hoursLost, req.worker.avgDailyHours, avgDailyEarnings, policy.plan),
      policy.maxWeeklyPayout
    );

    // Calculate fraud risk
    const fraudScore = getFraudScore(req.worker, triggerType, hoursLost);

    // IMPORTANT: Auto-approval is based on REAL API data, not user-entered values
    let status = 'Under Review';
    let autoApprovalDetails = null;
    let transactionId = null;

    // If geolocation data is provided, validate against real-time APIs
    if (latitude && longitude && AUTO_APPROVABLE_TRIGGERS.includes(triggerType) && fraudScore < 0.2) {
      try {
        console.log(`🔍 Validating claim (${triggerType}) against real API data at [${latitude}, ${longitude}]`);
        
        const validationResult = await validateClaimAgainstRealData(triggerType, latitude, longitude);
        autoApprovalDetails = validationResult;

        if (validationResult.success && validationResult.auto_approved) {
          status = 'Auto-Approved';
          transactionId = 'TXN' + Date.now();
          console.log(`✅ Claim AUTO-APPROVED based on API validation: ${validationResult.decision_reason}`);
        } else {
          status = 'Under Review';
          console.log(`⚠️ Claim UNDER REVIEW: ${validationResult.decision_reason}`);
        }
      } catch (validationError) {
        console.error('❌ API validation failed:', validationError.message);
        status = 'Under Review';
        autoApprovalDetails = {
          success: false,
          error: validationError.message,
          decision_reason: 'Could not validate against real-time API data. Moving to manual review.'
        };
      }
    } else {
      // If no geolocation or invalid trigger type, move to manual review
      if (!latitude || !longitude) {
        autoApprovalDetails = {
          success: false,
          error: 'Geolocation not provided',
          decision_reason: 'Geolocation coordinates required for automated validation'
        };
      } else if (!AUTO_APPROVABLE_TRIGGERS.includes(triggerType)) {
        autoApprovalDetails = {
          success: false,
          error: 'Manual review required',
          decision_reason: `Trigger type '${triggerType}' requires manual verification`
        };
      } else if (fraudScore >= 0.2) {
        autoApprovalDetails = {
          success: false,
          error: 'High fraud risk',
          decision_reason: `Fraud risk score (${fraudScore.toFixed(2)}) exceeds threshold`
        };
      }
    }

    // Create the claim record
    const claimData = {
      worker: req.worker._id,
      policy: policy._id,
      triggerType,
      triggerValue, // Reference only - NOT used for auto-approval
      hoursLost,
      payoutAmount,
      fraudScore,
      status,
      payoutTransactionId: transactionId,
      isAutoClaim: status === 'Auto-Approved',
      autoApprovalDetails: autoApprovalDetails // Store validation details
    };

    const claim = await Claim.create(claimData);

    // If auto-approved, update policy payout tracking
    if (status === 'Auto-Approved') {
      policy.totalPayoutReceived = (policy.totalPayoutReceived || 0) + payoutAmount;
      await policy.save();
    }

    // Return claim with validation details
    res.status(201).json({
      message: `Claim submitted. Status: ${status}`,
      claim: claim,
      autoApprovalDetails: autoApprovalDetails
    });

  } catch (err) {
    console.error('❌ Claim submission error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/claims/my
router.get('/my', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ worker: req.worker._id })
      .populate('policy', 'plan')
      .sort('-claimDate');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
