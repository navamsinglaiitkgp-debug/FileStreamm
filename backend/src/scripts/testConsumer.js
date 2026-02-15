require("../config/env");
const {getKafka} = require("../config/kafka");

async function main() {
    const kafka = getKafka();
    const consumer = kafka.consumer({groupId: "test-group-consumers"});
    await consumer.connect();
    await consumer.subscribe({topic: "test-topic", fromBeginning: true});
    console.log("Consumer connected and subscribed to topic 'test-topic'");
    
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const key = message.key ? message.key.toString() : null;
            const value = message.value?.toString();
            console.log(`Received message: topic=${topic} partition=${partition} key=${key} value=${value}`);
        }
    });
}

main().catch((error) => {
    console.error("Error in consumer:", error);
    process.exit(1);
});