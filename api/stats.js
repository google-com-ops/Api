const express = require('express');
const router = express.Router();
const AttackManager = require('../lib/attackManager');

const attackManager = new AttackManager();

router.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const os = require('os');
  
  const stats = attackManager.getStats();
  const activeAttacks = attackManager.getAllAttacks();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    attackStats: {
      ...stats,
      activeAttackDetails: activeAttacks.map(attack => ({
        id: attack.id,
        method: attack.method,
        uptime: attack.uptime,
        startTime: new Date(attack.startTime).toISOString()
      }))
    },
    systemStats: {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      },
      cpu: {
        architecture: process.arch,
        cpus: os.cpus().length,
        loadAverage: os.loadavg(),
        uptime: os.uptime()
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        resourceUsage: process.resourceUsage()
      },
      network: {
        hostname: os.hostname(),
        networkInterfaces: Object.keys(os.networkInterfaces()).length
      }
    },
    performance: {
      requestsPerSecond: stats.totalAttacks > 0 ? 
        Math.round(stats.totalAttacks / (process.uptime() || 1)) : 0,
      successRate: stats.totalAttacks > 0 ? 
        ((stats.successfulAttacks / stats.totalAttacks) * 100).toFixed(2) + '%' : '0%',
      errorRate: stats.totalAttacks > 0 ? 
        ((stats.failedAttacks / stats.totalAttacks) * 100).toFixed(2) + '%' : '0%'
    }
  });
});

// Real-time stats endpoint
router.get('/realtime', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  const sendStats = () => {
    const stats = attackManager.getStats();
    const memoryUsage = process.memoryUsage();
    
    const data = {
      timestamp: Date.now(),
      activeAttacks: stats.activeAttacks,
      totalRequests: stats.totalAttacks,
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      available: stats.available
    };
    
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Send stats every second
  const interval = setInterval(sendStats, 1000);
  
  // Send initial stats
  sendStats();
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;