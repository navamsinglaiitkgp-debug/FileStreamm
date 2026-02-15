const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        ownerId: {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
        originalName: {type: String, required: true},
        sizeBytes: {type: Number, required: true},
        bucket: {type: String, required: true},
        storageKey: {type: String, required: true, unique: true},
        status: {type: String, enum: ["READY", "FAILED"], default: "READY", index: true},
    },
    {timestamps: true}
);

fileSchema
module.exports = mongoose.model('File', fileSchema);