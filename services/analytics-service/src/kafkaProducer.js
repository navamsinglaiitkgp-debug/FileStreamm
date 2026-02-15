require("dotenv").config();
const { Kafka } = require("kafkajs");

let producer;

async function getProducer() {
  if (producer) return producer;

  const kafka = new Kafka({
    clientId: "analytics-service-producer",
    brokers: process.env.KAFKA_BROKERS.split(",").map(s => s.trim()),
  });

  producer = kafka.producer();
  await producer.connect();
  return producer;
}

async function publishAnalyticsUpdate(message) {
  const p = await getProducer();
  await p.send({
    topic: process.env.KAFKA_TOPIC_ANALYTICS_UPDATES || "analytics-updates",
    messages: [{ value: JSON.stringify(message) }],
  });
}

module.exports = { publishAnalyticsUpdate };
