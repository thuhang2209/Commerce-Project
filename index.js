/**
 * PHONE STORE API
 * Entry point của ứng dụng (hỗ trợ cả Local và Vercel)
 */

// Load environment variables từ .env (chỉ dùng khi chạy local)
require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Import modules
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { logger, notFound, errorHandler } = require('./middlewares');

// Khởi tạo Express app
const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ===== ROUTES =====
app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Phone Store',
        docs: '/api',
        version: '1.0.0'
    });
});

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// ===== KẾT NỐI DATABASE =====
// Kết nối DB khi module được load (cả local và Vercel)
connectDB().catch(err => {
    console.error('Failed to connect to database:', err.message);
});

// ===== EXPORT CHO VERCEL =====
// ⚠️ DÒNG NÀY RẤT QUAN TRỌNG — Vercel cần một hàm xử lý request/response
module.exports = serverless(app);

// ===== CHẠY LOCAL (chỉ khi gọi trực tiếp: node index.js) =====
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
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
}