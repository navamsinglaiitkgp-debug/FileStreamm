const express = require("express");
const UserAnalytics = require("./models/UserAnalytics");
const auth = require("./middlewares/auth");
const cors = require("cors");

function createApp() {
    const app = express();
    app.use(express.json());
    app.use(cors({ origin: "http://localhost:5173", credentials: true }));
    app.get("/analytics/user/:id", auth, async (req, res) => {
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        if (requesterId !== req.params.id && requesterRole !== "admin") {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        const doc = await UserAnalytics.findOne({ userId: req.params.id }).lean();
        res.json({success:true, userId: req.params.id, analytics: doc || null});
    });

    app.get("/analytics/summary", auth, async (req, res) => {
        if(req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        const agg = await UserAnalytics.aggregate([
          {
            $group: {
                _id: null,
                usersTracked: { $sum: 1 },
                totalUploads: { $sum: "$totalUploads" },
                totalUploadBytes: { $sum: "$totalUploadBytes" },
                totalDownloads: { $sum: "$totalDownloads" },
                filesDeleted: { $sum: "$filesDeleted" }
            },
            },
            {$project: {_id: 0}}
        ])
        res.json({success:true, summary: agg[0] || {usersTracked: 0, totalUploads: 0, totalUploadBytes: 0, totalDownloads: 0, filesDeleted: 0} });
    });

    app.get("/health", (req, res) => res.send("Analytics service running"));

    return app;
}

module.exports = {createApp};
