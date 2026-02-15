const AppError = require("../utils/AppError");
const uploadSessionRepository = require("../repositories/uploadSessionRepository");

exports.getStatus = async (req, res, next) => {
    try {
        const uploadId = req.params.uploadId;
        const session = await uploadSessionRepository.findById(uploadId);
        if (!session) {
            throw new AppError('Upload session not found', 404, 'UPLOAD_SESSION_NOT_FOUND');
        }
        if (session.ownerId.toString() !== req.user.id.toString()) {
            throw new AppError('Unauthorized access to upload session', 403, 'UNAUTHORIZED');
        }
        const received = session.receivedChunks || [];
        const total = session.totalChunks || 0;
        res.json({
            success: true,
            uploadId: session._id,
            status: session.status,
            totalChunks: total,
            receivedChunks: received,
            receivedCount: received.length,
            progress: total > 0 ? Math.round((received.length / total) * 100) : 0,
            originalName: session.originalName,
            contentType: session.contentType,
            fileId: session.fileId || null
        });
    } catch (error) {
        next(error);
    }
};