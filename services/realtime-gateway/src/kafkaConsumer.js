const { Kafka } = require("kafkajs");

function topicFileEvents() {
  return process.env.KAFKA_TOPIC_FILE_EVENTS || "file-events";
}
function topicAnalyticsUpdates() {
  return process.env.KAFKA_TOPIC_ANALYTICS_UPDATES || "analytics-updates";
}

async function startKafkaConsumer(io) {
  const kafka = new Kafka({
    clientId: "realtime-gateway",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  const consumer = kafka.consumer({ groupId: "realtime-gateway-group" });

  await consumer.connect();

  await consumer.subscribe({ topic: topicFileEvents(), fromBeginning: false });
  await consumer.subscribe({ topic: topicAnalyticsUpdates(), fromBeginning: false });

  console.log(`✅ Gateway consuming topics: ${topicFileEvents()}, ${topicAnalyticsUpdates()}`);

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      let payload;
      try {
        payload = JSON.parse(message.value.toString());
      } catch {
        return;
      }

      // (1) file-events -> activity stream
      if (topic === topicFileEvents()) {
        const userId = payload.actor?.userId ? String(payload.actor.userId) : null;

        // Send to that user only
        if (userId) io.to(`user:${userId}`).emit("file_event", payload);

        // Admins see all events
        io.to("admins").emit("file_event", payload);
        return;
      }

      // (2) analytics-updates -> counters snapshots (already after DB write)
      if (topic === topicAnalyticsUpdates()) {
        // expected shape:
        // { scope: "user", userId, counters, ... } OR { scope:"global", counters, ... }

        if (payload.scope === "user" && payload.userId) {
          const uid = String(payload.userId);
          io.to(`user:${uid}`).emit("analytics_update", payload);

          // Optional: admins can also see per-user analytics updates
          io.to("admins").emit("analytics_update", payload);
          return;
        }

        if (payload.scope === "global") {
          io.to("admins").emit("analytics_update", payload);
          return;
        }
      }
    },
  });

  return consumer;
}

module.exports = { startKafkaConsumer };
