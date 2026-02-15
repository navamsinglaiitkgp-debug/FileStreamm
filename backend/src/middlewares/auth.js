const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.sub;
        const email = decoded.email;
        if(!userId || !email) {
            return next(new AppError('Unauthorized: Invalid token payload', 401, 'UNAUTHORIZED'));
        }
        req.user = { id: userId, email, role: decoded.role || "user" };
        return next();
    } catch (err) {
        return next(new AppError('Unauthorized: Invalid token', 401, 'UNAUTHORIZED'));
    }
}

module.exports = auth;