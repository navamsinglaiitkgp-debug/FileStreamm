const { Server } = require("socket.io");
const { socketAuth } = require("./socketAuth");

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS || "*";
  if (raw.trim() === "*") return "*";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function createSocketServer(httpServer) {
  const origins = parseCorsOrigins();

  const io = new Server(httpServer, {
    cors: {
      origin: origins, // "*" allowed in dev
      credentials: true,
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    const u = socket.user;

    // User-specific room (all tabs/devices for same user get same stream)
    const userRoom = `user:${u.id}`;
    socket.join(userRoom);

    // Admin room for global feeds
    if (u.role === "admin") {
      socket.join("admins");
    }

    console.log(`✅ WS connected socket=${socket.id} user=${u.id} role=${u.role}`);

    // Useful debug/handshake event
    socket.emit("connected", {
      userId: u.id,
      role: u.role,
      serverTime: new Date().toISOString(),
      rooms: [userRoom, ...(u.role === "admin" ? ["admins"] : [])],
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ WS disconnected user=${u.id} reason=${reason}`);
    });
  });

  return io;
}

module.exports = { createSocketServer };
