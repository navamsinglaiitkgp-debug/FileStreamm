const FileDeleteService = require("../services/fileDeleteService");

exports.deleteFile = async (req, res, next) => {
    try {
        await FileDeleteService.deleteFile(req.user, req.params.id, req.requestId);
        res.json({success: true});
    } catch (error) {
        next(error);
    }
};