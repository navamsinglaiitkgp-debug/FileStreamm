const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        userId: {type: String, required: true, index: true},
        totalUploads: {type: Number, default: 0},
        totalDownloads: {type: Number, default: 0},
        totalUploadBytes: {type: Number, default: 0},
        filesDeleted: {type: Number, default: 0},
        processedEvents: {type: [String], default:[] }
    });

module.exports = mongoose.model("UserAnalytics", schema);
