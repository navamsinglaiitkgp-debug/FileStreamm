const crypto = require('crypto');

function requestLogger(req, res, next) {
    const start = Date.now();
    const incomingId = req.headers['x-request-id']; 
    const reqId = typeof incomingId === 'string' && incomingId.trim() !== '' ? incomingId : crypto.randomUUID();
    req.requestId = reqId;
    res.setHeader('x-request_id', reqId);
    console.log(`[${req.requestId}] --> ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.requestId}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
}

module.exports = requestLogger;