const AppError = require("../utils/AppError");
const uploadSessionRepository = require("../repositories/uploadSessionRepository");
const storageService = require("../services/storageService");

exports.presignChunkUpload = async (req, res, next) => {
    try {
        const {uploadId, chunkIndex} = req.params;
        const idx = Number(chunkIndex);
        if (isNaN(idx) || idx < 0) {
            throw new AppError("Invalid chunk index", 400, "BAD_REQUEST");
        }
        const session = await uploadSessionRepository.findById(uploadId);
        if (!session) {
            throw new AppError('Upload session not found', 404, 'UPLOAD_SESSION_NOT_FOUND');
        }
        if (session.ownerId.toString() !== req.user.id.toString()) {
            throw new AppError('Unauthorized access to upload session', 403, 'UNAUTHORIZED');
        }
        if (session.status === "COMPLETED") {
            throw new AppError('Cannot get presigned URL for a completed upload session', 400, 'UPLOAD_SESSION_COMPLETED');
        }
        if (idx >= session.totalChunks) {
            throw new AppError("chunkIndex exceeds totalChunks for this session", 400, "BAD_REQUEST");
        }
        const chunkKey = `uploads/${uploadId}/chunks/${idx}`;
        const {url, expiresInSeconds} = await storageService.getPresignedUploadUrl({
            key: chunkKey,
            contentType: "application/octet-stream"
        });
        res.json({
            success: true,
            uploadId,
            chunkIndex: idx,
            method: "PUT",
            url,
            expiresInSeconds,
            headers:{
                "Content-Type": "application/octet-stream"
            },
            key: chunkKey
        });
    } catch (error) {
        next(error);
    }
};