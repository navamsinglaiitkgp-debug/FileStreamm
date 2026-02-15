require("dotenv").config();
const { Kafka } = require("kafkajs");

const {processEvent} = require("./notificationProcessor");

async function startConsumer(){
  const kafka=new Kafka({
    clientId:"notification-service",
    brokers:process.env.KAFKA_BROKERS.split(",")
  });

  const consumer=kafka.consumer({groupId:"notification-group"});

  await consumer.connect();
  await consumer.subscribe({topic:process.env.KAFKA_TOPIC_FILE_EVENTS});

  await consumer.run({
    eachMessage:async({message})=>{
      const event=JSON.parse(message.value.toString());
      await processEvent(event);
    }
  });
}

module.exports={startConsumer};