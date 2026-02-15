require("dotenv").config();
const { Kafka } = require("kafkajs");
const {processEvent} = require("./analyticsProcessor");

async function startConsumer() {
    const kafka = new Kafka({
        clientId: "analytics-service",
        brokers: process.env.KAFKA_BROKERS.split(",")
    });
    
    const consumer = kafka.consumer({ groupId: "analytics-service-group" });
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_FILE_EVENTS, fromBeginning: true });

    console.log("Kafka consumer connected and subscribed to topic:", process.env.KAFKA_TOPIC_FILE_EVENTS);

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            //console.log("Received event:", event);
            await processEvent(event);
        }
    }); 
}

module.exports = {
    startConsumer
};