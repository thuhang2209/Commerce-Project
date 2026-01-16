require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('../config/db');
const routes = require('../routes');
const { logger, notFound, errorHandler } = require('../middlewares');

const app = express();

// ===== MIDDLEWARES =====
app.use(cors()); // Cho phép mọi nguồn truy cập (quan trọng khi test)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ===== ROUTES =====
// Dòng này rất quan trọng: Nó khớp với đường dẫn /api trong vercel.json
app.use('/api', routes);

// Route kiểm tra nhanh xem server sống hay chết
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server đang chạy ngon!' });
});

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// 👉 FIX LỖI SERVER: Thêm try-catch và log lỗi chi tiết
module.exports = async (req, res) => {
    try {
        // Cố gắng kết nối DB
        await connectDB(); 
    } catch (error) {
        console.error("❌ LỖI KẾT NỐI DB:", error);
        // Trả về lỗi rõ ràng cho trình duyệt thay vì crash
        return res.status(500).json({ 
            error: 'Database Connection Failed', 
            details: error.message 
        });
    }

    // Nếu DB ngon thì mới chạy App
    return app(req, res);
};