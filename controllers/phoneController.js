/**
 * PHONE CONTROLLER
 * Xu ly HTTP requests cho Phone
 * - Nhan request tu Router
 * - Goi Service xu ly
 * - Tra response cho client
 */

const phoneService = require('../services/phoneService');

/**
 * POST /api/phones - Them dien thoai moi
 */
async function create(req, res, next) {
    try {
        const phone = await phoneService.createPhone(req.body);
        res.status(201).json({
            success: true,
            message: 'Added new phone successfully',
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/phones - Lay danh sach dien thoai
 */
async function getAll(req, res, next) {
    try {
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
            brand: req.query.brand,
            status: req.query.status,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
        };

        const result = await phoneService.getAllPhones(options);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/phones/search?q=keyword - Tim kiem
 */
async function search(req, res, next) {
    try {
        const keyword = req.query.q;
        const phones = await phoneService.searchPhones(keyword);
        res.json({
            success: true,
            count: phones.length,
            data: phones
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/phones/:id - Lay 1 dien thoai
 */
async function getOne(req, res, next) {
    try {
        const phone = await phoneService.getPhoneById(req.params.id);
        res.json({
            success: true,
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/phones/:id - Cap nhat dien thoai
 */
async function update(req, res, next) {
    try {
        const phone = await phoneService.updatePhone(req.params.id, req.body);
        res.json({
            success: true,
            message: 'update phone successfully',
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/phones/:id/stock - Cap nhat ton kho
 */
async function updateStock(req, res, next) {
    try {
        const { quantity, operation } = req.body;
        const phone = await phoneService.updateStock(req.params.id, quantity, operation);
        res.json({
            success: true,
            message: 'Updated stock successfully',
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/phones/:id - Xoa dien thoai (soft delete)
 */
async function remove(req, res, next) {
    try {
        const result = await phoneService.deletePhone(req.params.id);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/phones/:id/permanent - Xoa vinh vien
 */
async function hardRemove(req, res, next) {
    try {
        const result = await phoneService.hardDeletePhone(req.params.id);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    getAll,
    search,
    getOne,
    update,
    updateStock,
    remove,
    hardRemove
};

