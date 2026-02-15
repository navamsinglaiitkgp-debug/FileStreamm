const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId:String,
  type:String,
  title:String,
  message:String,
  metadata:Object,
  status:{type:String,default:"UNREAD"},
  readAt:Date,
  emailStatus:{type:String,default:"SKIPPED"}
},{timestamps:true});

module.exports=mongoose.model("Notification",schema);
