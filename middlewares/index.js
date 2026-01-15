/**
 * MIDDLEWARES INDEX
 * Export tat ca middlewares
 */

const { notFound, errorHandler } = require('./errorHandler');
const logger = require('./logger');

module.exports = {
    notFound,
    errorHandler,
    logger
};
