const express = require('express');
const router = express.Router();

// Register all resource routes here
router.use('/auth',      require('./auth.routes'));
router.use('/patients',  require('./patient.routes'));
router.use('/sessions',  require('./session.routes'));
router.use('/dashboard', require('./dashboard.routes'));

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Visensa REST API v1',
    endpoints: {
      auth:      '/api/v1/auth',
      patients:  '/api/v1/patients',
      sessions:  '/api/v1/sessions',
      dashboard: '/api/v1/dashboard',
    },
    docs: '/api/v1/docs',
  });
});

module.exports = router;
