const express = require('express');
const router = express.Router();
const Trigger = require('../models/Trigger');
const { protect } = require('../middleware/auth');
const { z } = require('zod');

const simulateSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  city: z.string().optional(),
  value: z.any().optional(),
  severity: z.string().optional()
});

// Mock live disruption data by city
const getMockTriggers = (city, latitude = null, longitude = null) => [
  {
    type: 'Heavy Rainfall',
    city,
    latitude,
    longitude,
    value: '42mm/hr',
    threshold: '>35mm/hr',
    severity: 'High',
    isActive: true,
    affectedWorkers: Math.floor(Math.random() * 200) + 50,
    dataSource: 'OpenWeatherMap API',
    detectedAt: new Date()
  },
  {
    type: 'Severe AQI',
    city,
    latitude,
    longitude,
    value: 'AQI 387',
    threshold: '>350',
    severity: 'Critical',
    isActive: Math.random() > 0.5,
    affectedWorkers: Math.floor(Math.random() * 300) + 100,
    dataSource: 'CPCB API',
    detectedAt: new Date(Date.now() - 3600000)
  },
  {
    type: 'Flash Flood',
    city,
    latitude,
    longitude,
    value: 'Zone closure detected',
    threshold: 'Road closure signal',
    severity: 'High',
    isActive: Math.random() > 0.6,
    affectedWorkers: Math.floor(Math.random() * 150) + 30,
    dataSource: 'IMD Flood API',
    detectedAt: new Date(Date.now() - 7200000)
  }
];

// @route GET /api/triggers/live-location
router.get('/live-location', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    // Use current location instead of stored city
    const triggers = getMockTriggers('Current Location', latitude, longitude);
    res.json(triggers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/triggers/live
router.get('/live', protect, async (req, res) => {
  try {
    const city = req.worker.city || 'Mumbai';
    const triggers = getMockTriggers(city);
    res.json(triggers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/triggers/simulate
router.post('/simulate', protect, async (req, res) => {
  try {
    const parsed = simulateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { type, city, value, severity } = parsed.data;
    const trigger = await Trigger.create({
      type, city: city || req.worker.city,
      value, severity: severity || 'High',
      isActive: true,
      affectedWorkers: Math.floor(Math.random() * 200) + 50,
      dataSource: 'Simulated',
      expiresAt: new Date(Date.now() + 6 * 3600000)
    });
    res.status(201).json({ message: 'Trigger simulated!', trigger });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
