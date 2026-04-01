const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');
const { z } = require('zod');

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  avgWeeklyEarnings: z.coerce.number().positive('Average weekly earnings must be positive').optional(),
  avgDailyHours: z.coerce.number().positive('Average daily hours must be positive').max(24, 'Cannot exceed 24 hours').optional(),
});

// @route GET /api/workers/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id).select('-password');
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/workers/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    
    const worker = await Worker.findById(req.worker._id);
    const { name, email, avgWeeklyEarnings, avgDailyHours } = parsed.data;
    if (name) worker.name = name;
    if (email) worker.email = email;
    if (avgWeeklyEarnings) worker.avgWeeklyEarnings = avgWeeklyEarnings;
    if (avgDailyHours) worker.avgDailyHours = avgDailyHours;
    await worker.save();
    res.json({ message: 'Profile updated', worker });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
