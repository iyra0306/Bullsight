const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PYTHON_SERVICE_URL } = require('../controllers/stocksController');
const { dbAsync } = require('../config/db');

router.get('/health', async (req, res) => {
  let pythonStatus = 'unknown';
  let dbStatus = 'healthy';

  try {
    const pyResp = await axios.get(`${PYTHON_SERVICE_URL}/api/health`, { timeout: 2000 });
    pythonStatus = pyResp.data?.status || 'healthy';
  } catch (err) {
    pythonStatus = 'offline';
  }

  try {
    await dbAsync.get('SELECT 1');
  } catch (err) {
    dbStatus = 'degraded';
  }

  res.json({
    status: 'healthy',
    gateway: 'BullSight Node.js/Express Enterprise Gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
      python_ml_engine: pythonStatus
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
