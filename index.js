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
        message: 'Welcome to Phone Store',
        docs: '/api',
        version: '1.0.0'
    });
});

// ===== ERROR HANDLING =====

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// ===== SERVER SETUP =====

/**
 * Hàm khởi động Server (Dành cho chạy Local)
 */
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
            console.log('='.repeat(50));
            console.log('');
        });
    } catch (error) {
        console.error('Cannot start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    const { closeDB } = require('./config/db');
    if (closeDB) await closeDB();
    process.exit(0);
});

// ===== QUAN TRỌNG: CẤU HÌNH CHO VERCEL =====

// Kiểm tra xem file này có đang được chạy trực tiếp không (node index.js)
if (require.main === module) {
    // Nếu chạy Local -> Gọi hàm startServer để lắng nghe PORT
    startServer();
} else {
    // Nếu chạy trên Vercel -> Chỉ kết nối DB, KHÔNG gọi app.listen()
    // Vercel sẽ tự quản lý việc listen port
    connectDB().then(() => console.log('Connected to DB on Vercel'));
}

// XUẤT APP ĐỂ VERCEL CÓ THỂ CHẠY (Đây là dòng sửa lỗi "No exports found")
module.exports = app;