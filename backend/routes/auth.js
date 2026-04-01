const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  platform: z.enum(['Zepto', 'Blinkit', 'Other'], { errorMap: () => ({ message: 'Platform must be Zepto, Blinkit, or Other' }) }),
  platformId: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters'),
  avgWeeklyEarnings: z.coerce.number().positive('Average weekly earnings must be positive').optional(),
  avgDailyHours: z.coerce.number().positive('Average daily hours must be positive').max(24, 'Cannot exceed 24 hours').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { name, phone, email, platform, platformId, city, pincode,
      avgWeeklyEarnings, avgDailyHours, password } = parsed.data;

    const exists = await Worker.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    // Simple risk scoring based on city
    const highRiskCities = ['Mumbai', 'Delhi', 'Chennai'];
    const medRiskCities = ['Bengaluru', 'Kolkata', 'Hyderabad'];
    let riskScore = 0.3;
    let riskZone = 'Low';
    if (highRiskCities.includes(city)) { riskScore = 0.8; riskZone = 'High'; }
    else if (medRiskCities.includes(city)) { riskScore = 0.55; riskZone = 'Medium'; }

    const worker = await Worker.create({
      name, phone, email, platform, platformId, city, pincode,
      avgWeeklyEarnings: avgWeeklyEarnings || 4000,
      avgDailyHours: avgDailyHours || 10,
      riskScore, riskZone, password
    });

    res.status(201).json({
      _id: worker._id,
      name: worker.name,
      phone: worker.phone,
      platform: worker.platform,
      city: worker.city,
      riskScore: worker.riskScore,
      riskZone: worker.riskZone,
      token: generateToken(worker._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { phone, password } = parsed.data;
    const worker = await Worker.findOne({ phone });
    if (worker && (await worker.matchPassword(password))) {
      res.json({
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        platform: worker.platform,
        city: worker.city,
        riskScore: worker.riskScore,
        riskZone: worker.riskZone,
        token: generateToken(worker._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
