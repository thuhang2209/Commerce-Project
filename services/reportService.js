/**
 * REPORT SERVICE
 * Chua logic bao cao va thong ke
 */

const { getCollection } = require('../models/phone');

/**
 * Thong ke tong quan kho hang
 */
async function getInventorySummary() {
    const phones = getCollection();

    // Tong so dien thoai
    const totalProducts = await phones.countDocuments({ isDeleted: false });

    // Tong gia tri kho
    const valueResult = await phones.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
                totalCost: { $sum: { $multiply: ['$costPrice', '$quantity'] } },
                totalQuantity: { $sum: '$quantity' }
            }
        }
    ]).toArray();

    const values = valueResult[0] || { totalValue: 0, totalCost: 0, totalQuantity: 0 };

    // Dem theo trang thai
    const statusCounts = await phones.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    const statusMap = {};
    statusCounts.forEach(s => {
        statusMap[s._id] = s.count;
    });

    return {
        totalProducts,
        totalQuantity: values.totalQuantity,
        totalValue: values.totalValue,
        totalCost: values.totalCost || 0,
        potentialProfit: values.totalValue - (values.totalCost || 0),
        stockStatus: {
            inStock: statusMap['in_stock'] || 0,
            lowStock: statusMap['low_stock'] || 0,
            outOfStock: statusMap['out_of_stock'] || 0
        }
    };
}

/**
 * Thong ke theo hang san xuat
 */
async function getReportByBrand() {
    const phones = getCollection();

    const result = await phones.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: '$brand',
                totalProducts: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' },
                totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
                avgPrice: { $avg: '$price' }
            }
        },
        { $sort: { totalValue: -1 } }
    ]).toArray();

    return result.map(item => ({
        brand: item._id,
        totalProducts: item.totalProducts,
        totalQuantity: item.totalQuantity,
        totalValue: item.totalValue,
        avgPrice: Math.round(item.avgPrice)
    }));
}

/**
 * Danh sach san pham sap het hang (low stock)
 */
async function getLowStockProducts(threshold = 5) {
    const phones = getCollection();

    const result = await phones.find({
        isDeleted: false,
        quantity: { $lte: threshold, $gt: 0 }
    })
    .sort({ quantity: 1 })
    .toArray();

    return result;
}

/**
 * Danh sach san pham het hang
 */
async function getOutOfStockProducts() {
    const phones = getCollection();

    const result = await phones.find({
        isDeleted: false,
        quantity: { $lte: 0 }
    })
    .sort({ updatedAt: -1 })
    .toArray();

    return result;
}

/**
 * Top san pham gia tri cao nhat
 */
async function getTopValueProducts(limit = 10) {
    const phones = getCollection();

    const result = await phones.aggregate([
        { $match: { isDeleted: false } },
        {
            $addFields: {
                totalValue: { $multiply: ['$price', '$quantity'] }
            }
        },
        { $sort: { totalValue: -1 } },
        { $limit: limit }
    ]).toArray();

    return result;
}

/**
 * Bao cao theo khoang gia
 */
async function getReportByPriceRange() {
    const phones = getCollection();

    const result = await phones.aggregate([
        { $match: { isDeleted: false } },
        {
            $bucket: {
                groupBy: '$price',
                boundaries: [0, 5000000, 10000000, 20000000, 30000000, 50000000, Infinity],
                default: 'Other',
                output: {
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    products: { $push: '$name' }
                }
            }
        }
    ]).toArray();

    const priceLabels = {
        0: 'Less than 5 million',
        5000000: '5 - 10 million',
        10000000: '10 - 20 million',
        20000000: '20 - 30 million',
        30000000: '30 - 50 million',
        50000000: 'Over 5 million'
    };

    return result.map(item => ({
        range: priceLabels[item._id] || item._id,
        count: item.count,
        totalQuantity: item.totalQuantity
    }));
}

module.exports = {
    getInventorySummary,
    getReportByBrand,
    getLowStockProducts,
    getOutOfStockProducts,
    getTopValueProducts,
    getReportByPriceRange
};

