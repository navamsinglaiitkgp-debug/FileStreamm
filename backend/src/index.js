
require('./config/env');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const {connectDB, disconnectDB} = require('./config/db');
let server;
async function startServer() {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

async function shutdownServer(signal) {
    try {
        console.log(`Received ${signal}, Shutting down server gracefully...`);
        if (server) {
            server.close(() => {
                console.log("HTTP server closed.");
            });
        }

        await disconnectDB();
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
}
process.on('SIGINT', () => shutdownServer('SIGINT'));
process.on('SIGTERM', () => shutdownServer('SIGTERM'));
startServer();