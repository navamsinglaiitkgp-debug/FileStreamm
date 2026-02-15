require("dotenv").config();
const mongoose=require("mongoose");
const {startConsumer}=require("./kafkaConsumer");
const {createApp}=require("./http");

async function start(){
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo connected");

  startConsumer();

  const app=createApp();
  app.listen(process.env.PORT,()=>console.log("Notification API running"));
}

start();
