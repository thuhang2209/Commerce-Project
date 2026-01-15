/**
 * REPORT CONTROLLER
 * Xu ly HTTP requests cho bao cao
 */

const reportService = require('../services/reportService');

/**
 * GET /api/reports/summary - Tong quan kho hang
 */
async function getSummary(req, res, next) {
    try {
        const summary = await reportService.getInventorySummary();
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reports/by-brand - Thong ke theo hang
 */
async function getByBrand(req, res, next) {
    try {
        const report = await reportService.getReportByBrand();
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reports/low-stock - San pham sap het hang
 */
async function getLowStock(req, res, next) {
    try {
        const threshold = req.query.threshold || 5;
        const products = await reportService.getLowStockProducts(Number(threshold));
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reports/out-of-stock - San pham het hang
 */
async function getOutOfStock(req, res, next) {
    try {
        const products = await reportService.getOutOfStockProducts();
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reports/top-value - Top san pham gia tri cao
 */
async function getTopValue(req, res, next) {
    try {
        const limit = req.query.limit || 10;
        const products = await reportService.getTopValueProducts(Number(limit));
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reports/by-price-range - Thong ke theo khoang gia
 */
async function getByPriceRange(req, res, next) {
    try {
        const report = await reportService.getReportByPriceRange();
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSummary,
    getByBrand,
    getLowStock,
    getOutOfStock,
    getTopValue,
    getByPriceRange
};

