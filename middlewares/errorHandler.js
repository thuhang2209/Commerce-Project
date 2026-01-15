/**
 * ERROR HANDLER MIDDLEWARE
 * Xu ly tat ca loi tap trung
 */

/**
 * Not Found handler (404)
 */
function notFound(req, res, next) {
    const error = new Error(`Not found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
}

/**
 * Error handler chinh
 */

function errorHandler(err, req, res, next) {
    // Log loi (trong production nen dung logger)
    console.error('[ERROR]', {
        message: err.message,
        status: err.status,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Xac dinh status code
    const status = err.status || 500;

    // Response
    res.status(status).json({
        success: false,
        error: {
            message: err.message || 'Server error',
            status: status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}

module.exports = {
    notFound,
    errorHandler
};
