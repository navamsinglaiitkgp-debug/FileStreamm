const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success:false });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET/*, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }*/);

    req.user = { id: payload.sub , email: payload.email, role: payload.role || "user" };
    next();
  } catch {
    return res.status(401).json({ success:false });
  }
};
