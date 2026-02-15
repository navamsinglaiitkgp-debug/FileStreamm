function errorHandler(err, req, res, next) {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';
    const message =process.env.NODE_ENV === "production" && statusCode === 500
      ? "Something went wrong"
      : err.message || "Unknown error";
    const requestId = req.requestId || res.getHeader("x-request-id");
    res.status(statusCode).json({
        success: false,
        errorCode,
        message,
        requestId
    });
}

module.exports = errorHandler;