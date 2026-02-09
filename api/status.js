const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AttackManager = require('../lib/attackManager');

const attackManager = new AttackManager();

router.get('/', (req, res) => {
  const scriptNames = ['flood', 'flood1', 'h2god', 'h2-hold', 'glory'];
  const scriptData = [];
  
  scriptNames.forEach(name => {
    const scriptPath = path.join(__dirname, '../lib/scripts', `${name}.js`);
    const exists = fs.existsSync(scriptPath);
    
    let stats = null;
    if (exists) {
      try {
        stats = fs.statSync(scriptPath);
      } catch (err) {
        stats = { error: err.message };
      }
    }
    
    scriptData.push({
      name: name,
      exists: exists,
      path: exists ? scriptPath : null,
      stats: stats ? {
        size: stats.size || 0,
        modified: stats.mtime || null,
        created: stats.birthtime || null
      } : null
    });
  });
  
  const proxyPath = path.join(__dirname, '../assets/proxy.txt');
  const uaPath = path.join(__dirname, '../assets/ua.txt');
  
  const proxyExists = fs.existsSync(proxyPath);
  const uaExists = fs.existsSync(uaPath);
  
  let proxyCount = 0;
  let uaCount = 0;
  
  if (proxyExists) {
    try {
      const proxyContent = fs.readFileSync(proxyPath, 'utf8');
      proxyCount = proxyContent.split('\n').filter(line => line.trim()).length;
    } catch (err) {
      proxyCount = 0;
    }
  }
  
  if (uaExists) {
    try {
      const uaContent = fs.readFileSync(uaPath, 'utf8');
      uaCount = uaContent.split('\n').filter(line => line.trim()).length;
    } catch (err) {
      uaCount = 0;
    }
  }
  
  const activeAttacks = attackManager.getAllAttacks();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    server: {
      status: 'running',
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      },
      activeAttacks: attackManager.getActiveCount(),
      maxConcurrent: attackManager.maxConcurrent,
      available: attackManager.canStartAttack()
    },
    files: {
      scripts: scriptData,
      proxy: { 
        exists: proxyExists,
        count: proxyCount,
        path: proxyExists ? proxyPath : null
      },
      userAgents: { 
        exists: uaExists,
        count: uaCount,
        path: uaExists ? uaPath : null
      }
    },
    activeAttacks: activeAttacks.map(attack => ({
      id: attack.id,
      method: attack.method,
      status: attack.status,
      startTime: new Date(attack.startTime).toISOString(),
      uptime: attack.uptime
    })),
    systemInfo: {
      arch: process.arch,
      cpus: require('os').cpus().length,
      totalMemory: require('os').totalmem(),
      freeMemory: require('os').freemem(),
      loadAverage: require('os').loadavg()
    }
  });
});

module.exports = router;