/**
 * PHONE ROUTES
 * Dinh nghia cac endpoints cho Phone API
 */

const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');

/**
 * @route   GET /api/phones
 * @desc    Lay danh sach dien thoai (co phan trang, loc)
 * @query   page, limit, brand, status, minPrice, maxPrice, sortBy, sortOrder
 */
router.get('/', phoneController.getAll);

/**
 * @route   GET /api/phones/search
 * @desc    Tim kiem dien thoai
 * @query   q (tu khoa)
 */
router.get('/search', phoneController.search);

/**
 * @route   GET /api/phones/:id
 * @desc    Lay chi tiet 1 dien thoai
 */
router.get('/:id', phoneController.getOne);

/**
 * @route   POST /api/phones
 * @desc    Them dien thoai moi
 * @body    { name, brand, price, quantity, ... }
 */
router.post('/', phoneController.create);

/**
 * @route   PUT /api/phones/:id
 * @desc    Cap nhat dien thoai
 * @body    { name, price, ... } (cac truong can update)
 */
router.put('/:id', phoneController.update);

/**
 * @route   PATCH /api/phones/:id/stock
 * @desc    Cap nhat ton kho
 * @body    { quantity, operation: 'set' | 'add' | 'subtract' }
 */
router.patch('/:id/stock', phoneController.updateStock);

/**
 * @route   DELETE /api/phones/:id
 * @desc    Xoa dien thoai (soft delete)
 */
router.delete('/:id', phoneController.remove);

/**
 * @route   DELETE /api/phones/:id/permanent
 * @desc    Xoa vinh vien (can than!)
 */
router.delete('/:id/permanent', phoneController.hardRemove);

module.exports = router;
