const express = require('express');
const router = express.Router();
const AttackManager = require('../lib/attackManager');

const attackManager = new AttackManager();

router.get('/', (req, res) => {
  const methods = [
    {
      name: 'flood',
      description: 'Metode Flood dasar menggunakan HTTP/1.1',
      script: 'flood.js',
      parameters: [
        { name: 'target', type: 'string', required: true, description: 'Target URL' },
        { name: 'duration', type: 'number', required: true, description: 'Duration in seconds' }
      ],
      endpoint: '/api/flood',
      example: '/api/flood?target=https://example.com&duration=60'
    },
    {
      name: 'flood1',
      description: 'Metode Flood tingkat tinggi dengan multi-threading',
      script: 'flood1.js',
      parameters: [
        { name: 'target', type: 'string', required: true, description: 'Target URL' },
        { name: 'duration', type: 'number', required: true, description: 'Duration in seconds' }
      ],
      endpoint: '/api/flood1',
      example: '/api/flood1?target=https://example.com&duration=60'
    },
    {
      name: 'h2god',
      description: 'Metode HTTP/2 God dengan multiplexing',
      script: 'h2god.js',
      parameters: [
        { name: 'target', type: 'string', required: true, description: 'Target URL' },
        { name: 'time', type: 'number', required: true, description: 'Time in seconds' },
        { name: 'rate', type: 'number', required: true, description: 'Requests per second' },
        { name: 'threads', type: 'number', required: true, description: 'Number of threads' }
      ],
      endpoint: '/api/h2god',
      example: '/api/h2god?target=https://example.com&time=60&rate=100&threads=10'
    },
    {
      name: 'h2hold',
      description: 'Metode HTTP/2 Hold dengan connection persistence',
      script: 'h2-hold.js',
      parameters: [
        { name: 'target', type: 'string', required: true, description: 'Target URL' },
        { name: 'time', type: 'number', required: true, description: 'Time in seconds' },
        { name: 'rate', type: 'number', required: true, description: 'Requests per second' },
        { name: 'threads', type: 'number', required: true, description: 'Number of threads' }
      ],
      endpoint: '/api/h2hold',
      example: '/api/h2hold?target=https://example.com&time=60&rate=100&threads=10'
    },
    {
      name: 'glory',
      description: 'Metode Glory dengan advanced techniques',
      script: 'glory.js',
      parameters: [
        { name: 'target', type: 'string', required: true, description: 'Target URL' },
        { name: 'time', type: 'number', required: true, description: 'Time in seconds' },
        { name: 'rate', type: 'number', required: true, description: 'Requests per second' },
        { name: 'threads', type: 'number', required: true, description: 'Number of threads' }
      ],
      endpoint: '/api/glory',
      example: '/api/glory?target=https://example.com&time=60&rate=100&threads=10'
    }
  ];
  
  res.json({
    success: true,
    methods: methods,
    serverInfo: {
      maxConcurrent: attackManager.maxConcurrent,
      activeAttacks: attackManager.getActiveCount(),
      available: attackManager.canStartAttack()
    },
    note: 'All attacks are limited to 5 concurrent attacks maximum'
  });
});

module.exports = router;