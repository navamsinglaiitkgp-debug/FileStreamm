module.exports = function requireRole(requiredRole) {
    return function (req, res, next) {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: 'Forbidden: No user role found' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};