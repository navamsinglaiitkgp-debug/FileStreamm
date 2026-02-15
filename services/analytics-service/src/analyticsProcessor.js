const UserAnalytics = require("./models/UserAnalytics");
const ProcessedEvent = require("./models/ProcessedEvent");
const { publishAnalyticsUpdate } = require("./kafkaProducer");

const BUSINESS_EVENTS = new Set([
    "UPLOAD_COMPLETED",
    "DOWNLOAD_URL_GENERATED",
    "FILE_DELETED",
]);
async function getGlobalSummary() {
  const agg = await UserAnalytics.aggregate([
    {
      $group: {
        _id: null,
        usersTracked: { $sum: 1 },
        totalUploads: { $sum: "$totalUploads" },
        totalUploadBytes: { $sum: "$totalUploadBytes" },
        totalDownloads: { $sum: "$totalDownloads" },
        filesDeleted: { $sum: "$filesDeleted" },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return agg[0] || {
    usersTracked: 0,
    totalUploads: 0,
    totalUploadBytes: 0,
    totalDownloads: 0,
    filesDeleted: 0,
  };
}
async function isDuplicateEvent(eventId) {
    try {
        await ProcessedEvent.create({_id: eventId});
        return false; // Not a duplicate
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return true; // Duplicate event
        }
        throw error; // Other errors
    }
}

async function processEvent(event) {

    const {eventId, eventType, actor, data} = event;
    const userId = actor.userId;
    
    if (!BUSINESS_EVENTS.has(eventType)) {
        //console.log("Ignoring non-business event:", eventType);
        return;
    }
    const dup = await isDuplicateEvent(eventId);
    if(dup) return;

    const update = {};
    if (eventType === "UPLOAD_COMPLETED") {
      update.$inc = {
        totalUploads: 1,
        totalUploadBytes: Number(data.sizeBytes || 0),
      };
    } else if (eventType === "DOWNLOAD_URL_GENERATED") {
      update.$inc = { totalDownloads: 1 };
    } else if (eventType === "FILE_DELETED") {
      update.$inc = { filesDeleted: 1 };
    }

    await UserAnalytics.updateOne(
      { userId },
      { 
        $setOnInsert: { userId }, 
        ...update 
      },
      { upsert: true }
    );

    const userAnalytics = await UserAnalytics.findOne({ userId }).lean();

    const globalSummary = await getGlobalSummary();

    await publishAnalyticsUpdate({
        scope: "user",
        userId,
        counters: userAnalytics || null
    });

    await publishAnalyticsUpdate({
        scope:"global",
        counters: globalSummary
    });
}

module.exports = { processEvent };
