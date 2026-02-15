const StorageService = require('../services/storageService');

exports.uploadTest = async (req, res, next) => {
    try {
        const key = `debug/test-file-${Date.now()}.txt`;
        const buffer = Buffer.from('This is a test file for upload debugging.');
        const contentType = 'text/plain';
        const result = await StorageService.uploadBuffer({buffer, key, contentType});
        res.status(200).json({ success: true, uploaded: result });
    } catch (error) {
        next(error);
    }
};