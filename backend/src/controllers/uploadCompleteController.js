const UploadCompleteService = require("../services/uploadCompleteService");

exports.completeUpload = async (req, res, next) => {
    try {
        const result = await UploadCompleteService.completeUpload(req.user, req.params.uploadId, req.requestId);
        res.json({success: true, ...result});
    } catch (error) {
        next(error);
    }
};