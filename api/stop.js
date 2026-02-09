const express = require('express');
const router = express.Router();
const AttackManager = require('../lib/attackManager');

const attackManager = new AttackManager();

router.post('/', (req, res) => {
  const { attackId } = req.body;
  
  if (!attackId) {
    return res.status(400).json({
      success: false,
      error: 'attackId diperlukan'
    });
  }
  
  const attackInfo = attackManager.getAttackInfo(attackId);
  
  if (!attackInfo) {
    return res.status(404).json({
      success: false,
      error: `Attack ${attackId} tidak ditemukan`
    });
  }
  
  const stopped = attackManager.removeAttack(attackId);
  
  if (stopped) {
    res.json({
      success: true,
      message: `Attack ${attackId} berhasil dihentikan`,
      attackInfo: {
        id: attackId,
        method: attackInfo.method,
        duration: Date.now() - attackInfo.startTime,
        status: 'stopped'
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: `Gagal menghentikan attack ${attackId}`
    });
  }
});

// Stop all attacks
router.post('/all', (req, res) => {
  const activeAttacks = attackManager.getAllAttacks();
  
  if (activeAttacks.length === 0) {
    return res.json({
      success: true,
      message: 'Tidak ada attack yang aktif',
      stopped: 0
    });
  }
  
  let stoppedCount = 0;
  activeAttacks.forEach(attack => {
    if (attackManager.removeAttack(attack.id)) {
      stoppedCount++;
    }
  });
  
  res.json({
    success: true,
    message: `Berhasil menghentikan ${stoppedCount} attack`,
    stopped: stoppedCount,
    total: activeAttacks.length
  });
});

// Get active attacks
router.get('/active', (req, res) => {
  const activeAttacks = attackManager.getAllAttacks();
  
  res.json({
    success: true,
    activeAttacks: activeAttacks.map(attack => ({
      id: attack.id,
      method: attack.method,
      startTime: new Date(attack.startTime).toISOString(),
      uptime: attack.uptime,
      status: attack.status
    })),
    count: activeAttacks.length,
    maxConcurrent: attackManager.maxConcurrent
  });
});

module.exports = router;