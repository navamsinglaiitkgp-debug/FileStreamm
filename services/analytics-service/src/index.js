require("dotenv").config();
const mongoose = require("mongoose");
const {startConsumer} = require("./kafkaConsumer");
const {createApp} = require("./http");

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");
        await startConsumer();
    }
    catch (error) {
        console.error("Failed to start analytics service:", error);
        process.exit(1);
    }
    
    const app = createApp();
     const PORT = process.env.PORT || 7001;
    app.listen(PORT, () => {
        console.log(`Analytics service HTTP server running on port ${PORT}`);
    });
}

start();