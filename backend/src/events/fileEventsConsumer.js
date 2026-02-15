require("../config/env");
const {getKafka} = require("../config/kafka");

async function main() {
    const kafka = getKafka();
    const consumer = kafka.consumer({groupId: "file-events-consumers"});
    await consumer.connect();
    await consumer.subscribe({topic: "file-events", fromBeginning: true});
    console.log("File events consumer connected and subscribed to topic 'file-events'");
    
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log(`Received file event: topic=${topic} partition=${partition}`, message.value.toString());
            // Here you can add logic to process the file event, e.g. update database, trigger other actions, etc.
        }
    });
}

main().catch((error) => {
    console.error("Error in file events consumer:", error);
    process.exit(1);
});