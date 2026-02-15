class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true; // Mark as operational error
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;