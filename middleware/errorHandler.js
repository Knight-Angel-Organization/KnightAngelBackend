const { logEvents } = require('./logEvents');

export function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errLog.txt')
    console.error(err.stack)
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);

    if (process.env.NODE_ENV === 'production') {
        res.json({
            message: err.message,
        });
    } else {
        res.json({
            message: err.message,
            stack: err.stack,
        });
    }
}

module.exports = errorHandler;