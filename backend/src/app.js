const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const debugRoutes = require('./routes/debug');
const fileRoutes = require('./routes/file');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(requestLogger);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // only needed if you use cookies/auth headers
  })
);
// Use health routes
app.use('/', healthRoutes);
app.use('/', debugRoutes);
app.use('/', fileRoutes);
app.use('/', authRoutes);
app.use('/', uploadRoutes);
app.use(require('./routes/user'));
app.use(require('./routes/admin'));
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;