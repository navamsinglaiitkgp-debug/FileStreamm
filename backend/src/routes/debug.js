const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');
router.get('/debug/upload-test', debugController.uploadTest);

module.exports = router;