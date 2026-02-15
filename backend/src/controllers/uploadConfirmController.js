const AppError = require("../utils/AppError");
const uploadSessionRepository = require("../repositories/uploadSessionRepository");
const {publishFileEvent, EVENT_TYPES} = require("../events/fileEventPublisher");

exports.confirmChunk = async (req, res, next) => {
    try {
        const {uploadId, chunkIndex} = req.params;
        const idx = Number(chunkIndex);
        if (isNaN(idx) || idx < 0) {
            throw new AppError("Invalid chunk index", 400, "BAD_REQUEST");
        }
        const {chunkHash, chunkSizeBytes} = req.body || {};
        const session = await uploadSessionRepository.findById(uploadId);
        if (!session) {
            throw new AppError('Upload session not found', 404, 'UPLOAD_SESSION_NOT_FOUND');
        }
        if (session.ownerId.toString() !== req.user.id.toString()) {
            throw new AppError('Unauthorized access to upload session', 403, 'UNAUTHORIZED');
        }
        if (session.status === "COMPLETED") {
            throw new AppError('Cannot confirm chunk for a completed upload session', 400, 'UPLOAD_SESSION_COMPLETED');
        }
        if (idx >= session.totalChunks) {
            throw new AppError("chunkIndex exceeds totalChunks for this session", 400, "BAD_REQUEST");
        }

        const existingHash = session.chunkHashes?.get(idx.toString());
        if(existingHash && chunkHash && existingHash !== chunkHash) {
            throw new AppError("Chunk hash does not match previously uploaded chunk", 400, "BAD_REQUEST");
        }
        const updated = await uploadSessionRepository.markChunkReceived({
            uploadId,
            chunkIndex: idx,
            chunkHash: chunkHash ? String(chunkHash) : undefined,
            chunkSizeBytes: chunkSizeBytes
        });
        res.json({
            success: true,
            uploadId,
            chunkIndex: idx,
            totalChunks: updated.totalChunks,
            receivedCount: updated.receivedChunks.length,
            status: updated.status
        });
        try {
            await publishFileEvent({
                eventType: EVENT_TYPES.CHUNK_CONFIRMED,
                actorUserId: req.user.id,
                actorEmail: req.user.email,
                data: {
                    uploadId: String(uploadId),
                    chunkIndex: idx,
                    totalChunks: updated.totalChunks,
                    receivedCount: updated.receivedChunks.length,
                    status: updated.status
                },
                requestId: req.requestId,
                key: String(uploadId)
            });
         } catch (eventError) {
             console.error("Failed to publish event for chunk confirmation:", eventError);
        }
    } catch (error) {
        next(error);
    }
};
