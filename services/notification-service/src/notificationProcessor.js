const Notification = require("./models/Notification");
const {sendEmail} = require("./emailSender");

async function processEvent(event) {
    const {eventType, actor, data} = event;
    let title,message;

    if(eventType==="UPLOAD_COMPLETED"){
      title="Upload completed";
      message=`Your file ${data.originalName||"file"} is ready`;
    }
    else if(eventType==="FILE_DELETED"){
      title="File deleted";
      message="A file was deleted from your account";
    }
    else if(eventType==="DOWNLOAD_URL_GENERATED"){
      title="Download link generated";
      message="A download link was generated";
    }
    else return;

    const doc=await Notification.create({
      userId:actor.userId,
      type:eventType,
      title,
      message,
      metadata:data
    });

    if(process.env.EMAIL_ENABLED==="true"){
        const to = actor.email;
        if(!to) {
            doc.emailStatus="FAILED";
            await doc.save();
            return;
        }
      try{
        await sendEmail(to, title,message);
        doc.emailStatus="SENT";
      }catch{
        doc.emailStatus="FAILED";
      }
      await doc.save();
    }
}

module.exports={processEvent};