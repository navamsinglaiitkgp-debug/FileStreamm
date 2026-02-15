const multer = require('multer');
const path = require('path');
const fs = require('fs');

const chunkUploadDir = path.join(__dirname, '../../tmp_chunks');
if(!fs.existsSync(chunkUploadDir)) {
    fs.mkdirSync(chunkUploadDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, chunkUploadDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname);
    }
});

const chunkUpload = multer({ storage: storage , limits : {fileSize: 100 * 1024 * 1024}}); // Limit chunk size to 100MB

module.exports = chunkUpload;