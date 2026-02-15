const express=require("express");
const auth=require("./middlewares/auth");
const Notification=require("./models/Notification");
const cors=require("cors");

function createApp(){
  const app=express();
  app.use(express.json());

  // CORS CONFIG
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, // allow cookies / authorization headers
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.get("/notifications",auth,async(req,res)=>{
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = parseInt(req.query.skip) || 0;
    const items=await Notification.find({userId:req.user.id})
      .sort({createdAt:-1})
       .limit(limit)
       .skip(skip)
       .lean();

       const total = await Notification.countDocuments({ userId: req.user.id });

  res.json({
    success: true,
    paging: { limit, skip, total },
    notifications: items,
  });
  });

  app.patch("/notifications/:id/read",auth,async(req,res)=>{
    const n=await Notification.findOneAndUpdate(
      {_id:req.params.id,userId:req.user.id},
      {$set:{status:"READ",readAt:new Date()}},
      {new:true}
    ).lean();
    res.json(n);
  });

  app.get("/notifications/unread-count",auth,async(req,res)=>{
    const count=await Notification.countDocuments({userId:req.user.id,status:"UNREAD"});
    res.json({success:true,unreadCount:count});
  });

  return app;
}


module.exports={createApp};
