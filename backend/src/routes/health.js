const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

// Health check route
router.get('/health', healthController.healthCheck);

module.exports = router;