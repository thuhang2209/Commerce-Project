require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('../config/db');
const routes = require('../routes');
const { logger, notFound, errorHandler } = require('../middlewares');

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ===== ROUTES =====
app.use('/api', routes);

/*app.get('/', (req, res) => {
    res.json({
        message: 'Chao mung den voi Phone Store API!',
        docs: '/api',
        version: '1.0.0'
    });
});*/

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// 👉 QUAN TRỌNG NHẤT CHỖ NÀY
// Vercel sẽ gọi trực tiếp app này
module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};
