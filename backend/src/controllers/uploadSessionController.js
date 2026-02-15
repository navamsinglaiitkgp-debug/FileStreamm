const AppError = require("../utils/AppError");
const UploadSessionRepository = require("../repositories/uploadSessionRepository");
const {publishFileEvent, EVENT_TYPES} = require("../events/fileEventPublisher");

exports.initUpload = async(req, res, next) => {
    try {
        const {originalName, contentType, totalChunks} = req.body;
        if (!originalName || typeof originalName !== "string") {
            throw new AppError("originalName is required and must be a string", 400, "BAD_REQUEST");
        }
        if (!contentType || typeof contentType !== "string") {
            throw new AppError("contentType is required and must be a string", 400, "BAD_REQUEST");
        }
        if (!totalChunks || typeof totalChunks !== "number" || totalChunks <= 0) {
            throw new AppError("totalChunks is required and must be a positive number", 400, "BAD_REQUEST");
        }
        const n = Number(totalChunks);
        if(n > 10000) {
            throw new AppError("totalChunks is too large, max allowed is 10000", 400, "BAD_REQUEST");
        }
        const session = await UploadSessionRepository.create({
            ownerId: req.user.id,
            originalName : originalName.trim(),
            contentType : contentType.trim(),
            totalChunks: n,
            status: "INITIATED"
        });
        try {
            await publishFileEvent({
                eventType: EVENT_TYPES.UPLOAD_SESSION_INITIATED,
                actorUserId: req.user.id,
                actorEmail: req.user.email,
                data: {
                    uploadId: String(session._id),
                    originalName: session.originalName,
                    contentType: session.contentType,
                    totalChunks: session.totalChunks
                },
                requestId: req.requestId,
                key: String(session._id)
            });
        } catch (eventError) {
            console.error("Failed to publish event for upload session initiation:", eventError);
        }
        res.status(200).json({ success: true, uploadId: session._id, status: session.status, totalChunks: session.totalChunks });    
    } catch (error) {
        next(error);
    }
};
