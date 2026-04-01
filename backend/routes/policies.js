const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const { protect } = require('../middleware/auth');
const { z } = require('zod');

const planSchema = z.object({
  plan: z.enum(['Basic', 'Pro', 'Max'], { errorMap: () => ({ message: 'Invalid plan selected' }) })
});

const PLANS = {
  Basic: { premium: 29, maxPayout: 800, events: ['Heavy Rainfall', 'Flash Flood'] },
  Pro:   { premium: 49, maxPayout: 1500, events: ['Heavy Rainfall', 'Flash Flood', 'Severe AQI', 'Curfew/Bandh'] },
  Max:   { premium: 79, maxPayout: 2500, events: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'] }
};

const calculatePremium = (base, riskScore) => {
  if (riskScore == null) return base;
  return base + Math.round((riskScore - 0.55) * 40);
};

// @route POST /api/policies
router.post('/', protect, async (req, res) => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { plan } = parsed.data;

    const existing = await Policy.findOne({ worker: req.worker._id, status: 'Active' });
    if (existing) return res.status(400).json({ message: 'Active policy already exists' });

    const policy = await Policy.create({
      worker: req.worker._id,
      plan,
      weeklyPremium: calculatePremium(PLANS[plan].premium, req.worker.riskScore),
      maxWeeklyPayout: PLANS[plan].maxPayout,
      coverageEvents: PLANS[plan].events
    });
    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/policies/my
router.get('/my', protect, async (req, res) => {
  try {
    const policies = await Policy.find({ worker: req.worker._id }).sort('-createdAt');
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/policies/my/upgrade
router.put('/my/upgrade', protect, async (req, res) => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { plan } = parsed.data;

    const policy = await Policy.findOne({ worker: req.worker._id, status: 'Active' }).sort('-createdAt');
    if (!policy) return res.status(404).json({ message: 'No active policy found' });

    policy.plan = plan;
    policy.weeklyPremium = calculatePremium(PLANS[plan].premium, req.worker.riskScore);
    policy.maxWeeklyPayout = PLANS[plan].maxPayout;
    policy.coverageEvents = PLANS[plan].events;

    await policy.save();
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/policies/:id/pause
router.put('/:id/pause', protect, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    policy.status = policy.status === 'Active' ? 'Paused' : 'Active';
    await policy.save();
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
