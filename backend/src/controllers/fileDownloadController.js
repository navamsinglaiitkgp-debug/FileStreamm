const FileDownloadService = require("../services/fileDownloadService");

exports.getDownloadUrl = async (req, res, next) => {
    try {
        const result = await FileDownloadService.getDownloadUrl(req.user, req.params.id, req.requestId);
        res.json({success: true, ...result});
    } catch (error) {
        next(error);
    }
};