const express = require('express');
const { DatabaseService } = require('../lib/database');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await DatabaseService.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'WhitePointer Backend API'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;