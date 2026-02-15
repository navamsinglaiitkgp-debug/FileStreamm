const AppError = require("../utils/AppError");
const fileRepository = require("../repositories/fileRepository");
const storageService = require("./storageService");
const {publishFileEvent, EVENT_TYPES} = require("../events/fileEventPublisher");

class FileDownloadService {
    async getDownloadUrl(user, fileId, requestId) {
        const fileRecord = await fileRepository.findById(fileId);
        if (!fileRecord) {
            throw new AppError("File not found", 404, "NOT_FOUND");
        }
        if (fileRecord.ownerId.toString() !== user.id.toString()) {
            throw new AppError("Unauthorized access to file", 403, "FORBIDDEN");
        }
        if (fileRecord.status !== "READY") {
            throw new AppError("File is not ready for download", 400, "BAD_REQUEST");
        }
        const url = await storageService.getPresignedUrl({
            key: fileRecord.storageKey
        });
        try {
            await publishFileEvent({
                eventType: EVENT_TYPES.DOWNLOAD_URL_GENERATED,
                actorUserId: user.id,
                actorEmail: user.email,
                data: {
                    fileId: String(fileRecord._id),
                    expiresInSeconds: Number(process.env.DOWNLOAD_URL_EXPIRES_SECONDS || 60)
                },
                requestId: String(requestId),
                key: String(fileId)
            });
        } catch (eventError) {
            console.error("Failed to publish event for download initiation:", eventError);
        }
        return {fileId: fileRecord._id, url, expiresInSeconds: Number(process.env.DOWNLOAD_URL_EXPIRES_SECONDS || 60) };
    }
}

module.exports = new FileDownloadService();