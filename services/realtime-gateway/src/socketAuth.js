const jwt = require("jsonwebtoken");

function socketAuth(io) {
  io.use((socket, next) => {
    try {
      // Client connects like: io("http://localhost:7003", { auth: { token } })
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log("❌ WS auth failed: Missing token");
        return next(new Error("Missing token"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (!payload.sub) {
        console.log("❌ WS auth failed: Token missing sub");
        return next(new Error("Token missing sub"));
      }
      socket.user = {
        id: String(payload.sub),
        email: payload.email ? String(payload.email) : undefined,
        role: payload.role ? String(payload.role) : "user",
      };
      console.log(`✅ WS auth success: userId=${socket.user.id} role=${socket.user.role}`);
      return next();
    } catch (e) {
        console.log("❌ WS auth failed: Invalid token", e);
      return next(new Error("Invalid token: " + (e.message || "unknown")));
    }
  });
}

module.exports = { socketAuth };
