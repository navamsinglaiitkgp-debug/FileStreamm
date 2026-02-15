const mongoose = require("mongoose");

const uploadSessionSchema = new mongoose.Schema(
    {
        ownerId : {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
        originalName : {type: String, required: true},
        contentType : {type: String, required: true},
        totalChunks : {type: Number, required: true, min: 1},
        receivedChunks : {type: [Number], default: []},
        chunkHashes: {type: Map, of: String, default: {}},
        chunkSizes: {type: Map, of: Number, default: {}},
        status : {
            type: String,
            enum: ["INITIATED", "UPLOADING", "COMPLETED", "FAILED", "ABORTED"],
            default: "INITIATED",
            index: true
        },
        expiresAt: {type: Date, default: () => new Date(Date.now() + 24*60*60*1000), index: true},
        finalBucket: {type: String},
        finalStorageKey: {type: String},
        fileId: {type: mongoose.Schema.Types.ObjectId, ref: "File"}
    },
    { timestamps: true }
);

uploadSessionSchema.index({ ownerId: 1, createdAt: -1 });
uploadSessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
const UploadSession = mongoose.model("UploadSession", uploadSessionSchema);

module.exports = UploadSession;