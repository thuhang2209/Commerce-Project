/**
 * ROUTES INDEX
 * Gom tat ca routes lai
 */

const express = require('express');
const router = express.Router();

const phoneRoutes = require('./phoneRoutes');

// API info
router.get('/', (req, res) => {
    res.json({
        name: 'Phone Store API',
        version: '1.0.0',
        endpoints: {
            phones: '/api/phones',
        }
    });
});

// Mount routes
router.use('/phones', phoneRoutes);

module.exports = router;
