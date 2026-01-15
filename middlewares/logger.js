/**
 * LOGGER MIDDLEWARE
 * Ghi log cac request
 */

function logger(req, res, next) {
    const start = Date.now();

    // Khi response hoan thanh
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        // Mau theo status
        if (res.statusCode >= 500) {
            console.error('\x1b[31m%s\x1b[0m', log); // Red
        } else if (res.statusCode >= 400) {
            console.warn('\x1b[33m%s\x1b[0m', log);  // Yellow
        } else {
            console.log('\x1b[32m%s\x1b[0m', log);   // Green
        }
    });

    next();
}

module.exports = logger;
