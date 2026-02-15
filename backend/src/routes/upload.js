const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const uploadSessionController = require('../controllers/uploadSessionController');
const chunkUploadController = require('../controllers/uploadChunkController');
const chunkUpload = require('../middlewares/chunkUpload');
const uploadCompleteController = require('../controllers/uploadCompleteController');
const uploadStatusController = require('../controllers/uploadStatusController');
const uploadPresignController = require('../controllers/uploadPresignController');
const uploadConfirmController = require('../controllers/uploadConfirmController');

router.post("/uploads/:uploadId/chunks/:chunkIndex/confirm", auth, uploadConfirmController.confirmChunk);
router.post("/uploads/:uploadId/chunks/:chunkIndex/presign", auth, uploadPresignController.presignChunkUpload);
router.get("/uploads/:uploadId/status", auth, uploadStatusController.getStatus);
router.post("/uploads/:uploadId/complete", auth, uploadCompleteController.completeUpload);
router.put("/uploads/:uploadId/chunk/:chunkIndex", auth, chunkUpload.single('chunk'), chunkUploadController.uploadChunk);
router.post("/uploads/init", auth, uploadSessionController.initUpload);

module.exports = router;