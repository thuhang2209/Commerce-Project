/**
 * PHONE STORE API
 * Entry point cua ung dung
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import modules
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { logger, notFound, errorHandler } = require('./middlewares');

// Khoi tao Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====

// CORS - cho phep frontend truy cap
app.use(cors());

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Logger - ghi log moi request
app.use(logger);

// ===== ROUTES =====

// API routes
app.use('/api', routes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Chao mung den voi Phone Store API!',
        docs: '/api',
        version: '1.0.0'
    });
});

// ===== ERROR HANDLING =====

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// ===== START SERVER =====

async function startServer() {
    try {
        // Ket noi database
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log('   PHONE STORE API');
            console.log('='.repeat(50));
            console.log(`   Server:    http://localhost:${PORT}`);
            console.log(`   API:       http://localhost:${PORT}/api`);
            console.log(`   Phones:    http://localhost:${PORT}/api/phones`);
            console.log(`   Reports:   http://localhost:${PORT}/api/reports`);
            console.log('='.repeat(50));
            console.log('');
        });
    } catch (error) {
        console.error('Khong the khoi dong server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nDang dong ket noi...');
    const { closeDB } = require('./config/db');
    await closeDB();
    process.exit(0);
});

// Start!
startServer();
