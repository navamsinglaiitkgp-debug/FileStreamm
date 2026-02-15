require("dotenv").config();
const express = require("express");
const http = require("http");
const { createSocketServer } = require("./socketServer");
const { startKafkaConsumer } = require("./kafkaConsumer");

async function start() {
  const app = express();
  app.get("/health", (req, res) => res.send("Realtime gateway running"));

  const server = http.createServer(app);
  const io = createSocketServer(server);

  // Start Kafka consumer (keeps running)
  startKafkaConsumer(io).catch((e) => {
    console.error("❌ Kafka consumer crashed:", e);
    process.exit(1);
  });

  const port = Number(process.env.PORT || 7003);
  server.listen(port, () => {
    console.log(`✅ Realtime Gateway listening on http://localhost:${port}`);
  });
}

start().catch((e) => {
  console.error("❌ Gateway failed to start:", e);
  process.exit(1);
});
