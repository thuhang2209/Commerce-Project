/**
 * PHONE SERVICE
 * Chua tat ca business logic cho Phone
 * - CRUD operations
 * - Tim kiem
 * - Xu ly nghiep vu
 */

const { ObjectId } = require('mongodb');
const { getCollection, validatePhone, normalizePhone, calculateStatus } = require('../models/phone');

/**
 * CREATE - Them dien thoai moi
 */
async function createPhone(phoneData) {
    // Validate
    const validation = validatePhone(phoneData);
    if (!validation.isValid) {
        throw { status: 400, message: validation.errors.join(', ') };
    }

    const phones = getCollection();

    // Chuan hoa va them metadata
    const newPhone = {
        ...normalizePhone(phoneData),
        imeiList: phoneData.imeiList || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    };

    const result = await phones.insertOne(newPhone);

    return {
        _id: result.insertedId,
        ...newPhone
    };
}

/**
 * READ - Lay tat ca dien thoai (co phan trang va loc)
 */
async function getAllPhones(options = {}) {
    const {
        page = 1,
        limit = 20,
        brand,
        status,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = -1
    } = options;

    const phones = getCollection();

    // Xay dung filter
    const filter = { isDeleted: false };

    if (brand) {
        filter.brand = { $regex: brand, $options: 'i' };
    }
    if (status) {
        filter.status = status;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Dem tong so
    const total = await phones.countDocuments(filter);

    // Lay du lieu voi phan trang
    const data = await phones
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

/**
 * READ - Lay 1 dien thoai theo ID
 */
async function getPhoneById(id) {
    if (!ObjectId.isValid(id)) {
        throw { status: 400, message: 'Invalid ID' };
    }

    const phones = getCollection();
    const phone = await phones.findOne({
        _id: new ObjectId(id),
        isDeleted: false
    });

    if (!phone) {
        throw { status: 404, message: 'Phone not found' };
    }

    return phone;
}

/**
 * READ - Tim kiem dien thoai
 */
async function searchPhones(keyword) {
    if (!keyword || keyword.trim() === '') {
        throw { status: 400, message: 'Search keyword cannot be empty' };
    }

    const phones = getCollection();

    // Tim trong name, brand, model, color
    const result = await phones.find({
        isDeleted: false,
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } },
            { color: { $regex: keyword, $options: 'i' } }
        ]
    }).toArray();

    return result;
}

/**
 * UPDATE - Cap nhat dien thoai
 */
async function updatePhone(id, updateData) {
    if (!ObjectId.isValid(id)) {
        throw { status: 400, message: 'Invalid ID' };
    }

    // Validate
    const validation = validatePhone(updateData, true);
    if (!validation.isValid) {
        throw { status: 400, message: validation.errors.join(', ') };
    }

    const phones = getCollection();

    // Loai bo cac truong khong duoc sua
    const { _id, createdAt, isDeleted, ...safeData } = updateData;

    // Chuan hoa va cap nhat
    const normalized = normalizePhone(safeData);
    normalized.updatedAt = new Date();

    const result = await phones.updateOne(
        { _id: new ObjectId(id), isDeleted: false },
        { $set: normalized }
    );

    if (result.matchedCount === 0) {
        throw { status: 404, message: 'Phone not found' };
    }

    return await getPhoneById(id);
}

/**
 * UPDATE - Cap nhat so luong ton kho
 */
async function updateStock(id, quantity, operation = 'set') {
    if (!ObjectId.isValid(id)) {
        throw { status: 400, message: 'Invalid ID' };
    }

    const phones = getCollection();
    let updateQuery = {};

    if (operation === 'add') {
        updateQuery = { $inc: { quantity: quantity } };
    } else if (operation === 'subtract') {
        updateQuery = { $inc: { quantity: -quantity } };
    } else {
        updateQuery = { $set: { quantity: quantity } };
    }

    // Them updatedAt
    updateQuery.$set = updateQuery.$set || {};
    updateQuery.$set.updatedAt = new Date();

    const result = await phones.updateOne(
        { _id: new ObjectId(id), isDeleted: false },
        updateQuery
    );

    if (result.matchedCount === 0) {
        throw { status: 404, message: 'Phone not found' };
    }

    // Cap nhat status dua tren quantity moi
    const phone = await getPhoneById(id);
    await phones.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: calculateStatus(phone.quantity) } }
    );

    return await getPhoneById(id);
}

/**
 * DELETE - Xoa dien thoai (soft delete)
 */
async function deletePhone(id) {
    if (!ObjectId.isValid(id)) {
        throw { status: 400, message: 'Invalid ID' };
    }

    const phones = getCollection();

    const result = await phones.updateOne(
        { _id: new ObjectId(id), isDeleted: false },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date()
            }
        }
    );

    if (result.matchedCount === 0) {
        throw { status: 404, message: 'Phone not found' };
    }

    return { message: 'Deleted successfully' };
}

/**
 * DELETE - Xoa vinh vien (hard delete) - Can than!
 */
async function hardDeletePhone(id) {
    if (!ObjectId.isValid(id)) {
        throw { status: 400, message: 'Invalid ID' };
    }

    const phones = getCollection();
    const result = await phones.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw { status: 404, message: 'Phone not found' };
    }

    return { message: 'Deleted permanently' };
}

module.exports = {
    createPhone,
    getAllPhones,
    getPhoneById,
    searchPhones,
    updatePhone,
    updateStock,
    deletePhone,
    hardDeletePhone
};

