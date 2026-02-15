const {getKafka} = require("../config/kafka");

let producerInstance = null;

async function getProducer() {
    if (producerInstance) {
        return producerInstance;
    }

    const kafka = getKafka();
    producerInstance = kafka.producer();
    await producerInstance.connect();
    console.log("Kafka producer connected");
    return producerInstance;
}

async function publishEvent({topic, key, value}) {
    const producer = await getProducer();
    await producer.send({
            topic,
            messages: [
                {
                    key: String(key),
                    value: JSON.stringify(value)
                }
            ]
    });
}

module.exports = {
    publishEvent
}