/**
 * ROUTES INDEX
 * Gom tat ca routes lai
 */

const express = require('express');
const router = express.Router();

const phoneRoutes = require('./phoneRoutes');
const reportRoutes = require('./reportRoutes');

// API info
router.get('/', (req, res) => {
    res.json({
        name: 'Phone Store API',
        version: '1.0.0',
        endpoints: {
            phones: '/api/phones',
            reports: '/api/reports',
        }
    });
});

// Mount routes
router.use('/phones', phoneRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
