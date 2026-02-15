const EVENT_TYPES = require("./eventTypes");
const {publishEvent} = require("./eventProducer");
const {buildEvent} = require("./eventBuilder");

async function publishFileEvent({eventType, actorUserId, actorEmail, data, requestId, key}) {
    const topic = process.env.KAFKA_TOPIC_FILE_EVENTS || "file-events";
    const event = buildEvent({
        eventType,
        actorUserId,
        actorEmail,
        data,
        requestId,
        version: 1
    });
    const partitionKey = key || actorUserId;
    await publishEvent({topic, key: partitionKey, value: event});
    console.log(`Event published to topic '${topic}':`, event);
    return event;
}

module.exports = {
    publishFileEvent,
    EVENT_TYPES
};