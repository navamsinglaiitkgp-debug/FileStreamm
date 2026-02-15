require("../config/env");
const {publishEvent} = require("../events/eventProducer");
const EVENT_TYPES = require("../events/eventTypes");
const {buildEvent} = require("../events/eventBuilder");

async function main() {
    const topic = "test-topic";
    const event = buildEvent({
        eventType: EVENT_TYPES.UPLOAD_COMPLETED,
        actorUserId : "65a000000000000000000001",
        data: {
            fileId: "demo-file",
            sizeBytes: 12345
        },
        requesId: "demoId"
    });
    await publishEvent({topic, key: event.actor.userId, value: event});
    console.log("Event published to topic 'test-topic':", event);
}

main().catch((error) => {
    console.error("Error in producer:", error);
    process.exit(1);
});