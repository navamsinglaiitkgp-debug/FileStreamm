const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET/*, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }*/);
        const userId = decoded.sub;
        const email = decoded.email;
        if(!userId || !email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token payload' });
        }
        req.user = { id: userId, email , role: decoded.role || "user"};
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
}

module.exports = auth;