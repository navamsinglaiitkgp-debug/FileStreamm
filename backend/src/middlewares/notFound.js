const AppError = require('../utils/AppError');

function notFound(req, res, next) {
    const error = new AppError(`Can't find ${req.method} ${req.originalUrl} on this server!`, 404, 'NOT_FOUND');
    next(error);
}

module.exports = notFound;