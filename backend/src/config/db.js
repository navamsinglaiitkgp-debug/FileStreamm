const mongoose = require('mongoose');
let isConnected = false;
async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set. Did you load ./config/env ?");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production", 
  });

  isConnected = true;
  console.log("✅ MongoDB connected");
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.connection.close(false);
  isConnected = false;
  console.log("🛑 MongoDB disconnected");
}

module.exports= {
    connectDB,
    disconnectDB
}