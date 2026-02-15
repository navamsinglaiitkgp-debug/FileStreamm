const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    _id: { type: String },            // eventId
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);
schema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model("ProcessedEvent", schema);
