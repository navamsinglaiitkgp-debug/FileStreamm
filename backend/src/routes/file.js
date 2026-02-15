const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middlewares/auth');
const uploadController = require('../controllers/fileUpload');
const upload = require('../middlewares/upload');
const fileDownloadController = require('../controllers/fileDownloadController');
const fileDeleteController = require('../controllers/fileDeleteController');

router.delete("/files/:id", auth, fileDeleteController.deleteFile);
// Route for uploading a file
router.post('/files/upload', auth, upload.single("file"), uploadController.uploadFile);
router.get('/files', auth, fileController.listMyFiles);

router.get("/files/:id/download-url", auth, fileDownloadController.getDownloadUrl);
module.exports = router;