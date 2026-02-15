const {Kafka} = require("kafkajs");

function getKafka() {
    const brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

    if (brokers.length === 0) {
        throw new Error("KAFKA_BROKERS is not set or empty. Did you load ./config/env ?");
    }

    const clientId = process.env.KAFKA_CLIENT_ID || "filestreamm-api";
    return new Kafka({clientId, brokers});
}

module.exports = {
    getKafka
};