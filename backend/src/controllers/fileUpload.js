const fileService = require("../services/fileService");

exports.uploadFile = async (req, res, next) => {
    try {
        const result = await fileService.uploadSingleFile(req.user, req.file);
        res.status(200).json({ success: true, file: result });  
    } catch (error) {
        next(error);
    }
};