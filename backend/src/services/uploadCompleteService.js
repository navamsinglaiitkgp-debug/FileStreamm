const crypto = require("crypto");
const {PassThrough} = require("stream");
const AppError = require("../utils/AppError");
const storageService = require("./storageService");
const fileRepository = require("../repositories/fileRepository");
const uploadSessionRepository = require("../repositories/uploadSessionRepository");
const {publishFileEvent, EVENT_TYPES} = require("../events/fileEventPublisher");

class UploadCompleteService {
    async completeUpload(user, uploadId, requestId) {
        const session = await uploadSessionRepository.findById(uploadId);
        if (!session) {
            throw new AppError("Upload session not found", 404, "NOT_FOUND");
        }
        if (session.ownerId.toString() !== user.id) {
            throw new AppError("You do not have permission to complete this upload session", 403, "FORBIDDEN");
        }
        if (session.status === "COMPLETED") {
            return {fileId: session.fileId, alreadyCompleted:true};
        }
        const totalChunks = session.totalChunks;
        const receivedChunks = session.receivedChunks || [];

        for (let i = 0; i < totalChunks; i++) {
            if (!receivedChunks.includes(i)) {
                throw new AppError(`Chunk ${i} has not been uploaded`, 400, "BAD_REQUEST");
            }
        }
        let totalSize = 0;
        for (let i = 0; i < totalChunks; i++) {
            const chunkSize = session.chunkSizes?.get(i.toString());
            if (typeof chunkSize === "number") {
                totalSize += chunkSize;
            }
        }
        const random = crypto.randomBytes(16).toString("hex");
        const finalKey = `users/${user.id}/${Date.now()}-${random}-${session.originalName}`;
        const pass = new PassThrough();

        const uploadPromise = storageService.uploadStream({
            stream: pass,
            key: finalKey,
            contentType: session.contentType
        });

        try {
            for (let i = 0; i < totalChunks; i++) {
                const chunkKey = `uploads/${uploadId}/chunks/${i}`;
                const chunkStream = await storageService.getObjectStream({key: chunkKey});
                await new Promise((resolve, reject) => {
                    chunkStream.pipe(pass, {end: false});
                    chunkStream.on("end", resolve);
                    chunkStream.on("error", reject);
                });
            }
            pass.end();
            const uploadResult = await uploadPromise;
            const fileRecord = await fileRepository.create({
                ownerId: user.id,
                originalName: session.originalName,
                sizeBytes: totalSize,
                contentType: session.contentType,
                storageKey: finalKey,
                bucket: process.env.S3_BUCKET,
                status:"READY"
            });
            await uploadSessionRepository.setCompletion(uploadId, fileRecord._id, process.env.S3_BUCKET, finalKey);
            await storageService.deletePrefix({prefix: `uploads/${uploadId}/chunks/`});
            try {
                await publishFileEvent({
                    eventType: EVENT_TYPES.UPLOAD_COMPLETED,
                    actorUserId: user.id,
                    actorEmail: user.email,
                    data: {
                        fileId: String(fileRecord._id),
                        uploadId: String(uploadId),
                        originalName: session.originalName,
                        sizeBytes: totalSize,
                        contentType: session.contentType,
                        storageKey: finalKey,
                    },
                    requestId,
                    key: String(uploadId)
                });
            } catch (eventError) {
                console.error("Failed to publish event for upload completion:", eventError);
            }
            return {fileId: fileRecord._id, storageKey: finalKey};
        } catch (error) {
            uploadSessionRepository.setStatus(uploadId, "FAILED");
            throw error;
        }
    }
}

module.exports = new UploadCompleteService();