/**
 * REPORT ROUTES
 * Dinh nghia cac endpoints cho bao cao
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * @route   GET /api/reports/summary
 * @desc    Tong quan kho hang (tong so, gia tri, trang thai)
 */
router.get('/summary', reportController.getSummary);

/**
 * @route   GET /api/reports/by-brand
 * @desc    Thong ke theo hang san xuat
 */
router.get('/by-brand', reportController.getByBrand);

/**
 * @route   GET /api/reports/low-stock
 * @desc    Danh sach san pham sap het hang
 * @query   threshold (mac dinh 5)
 */
router.get('/low-stock', reportController.getLowStock);

/**
 * @route   GET /api/reports/out-of-stock
 * @desc    Danh sach san pham het hang
 */
router.get('/out-of-stock', reportController.getOutOfStock);

/**
 * @route   GET /api/reports/top-value
 * @desc    Top san pham gia tri cao nhat
 * @query   limit (mac dinh 10)
 */
router.get('/top-value', reportController.getTopValue);

/**
 * @route   GET /api/reports/by-price-range
 * @desc    Thong ke theo khoang gia
 */
router.get('/by-price-range', reportController.getByPriceRange);

module.exports = router;
