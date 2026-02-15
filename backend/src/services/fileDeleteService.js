const AppError = require("../utils/AppError");
const fileRepository = require("../repositories/fileRepository");
const storageService = require("./storageService");
const {publishFileEvent, EVENT_TYPES} = require("../events/fileEventPublisher");

class FileDeleteService {
    async deleteFile(user, fileId, requestId) {
        const fileRecord = await fileRepository.findById(fileId);
        if (!fileRecord) {
            throw new AppError("File not found", 404, "NOT_FOUND");
        }
        if (fileRecord.ownerId.toString() !== user.id.toString()) {
            throw new AppError("Unauthorized access to file", 403, "FORBIDDEN");
        }
        try {
            await storageService.deleteObject({ key: fileRecord.storageKey });  
        } catch (error) {
            throw new AppError("Failed to delete file from storage", 500, "STORAGE_DELETE_FAILED");
        }
        await fileRepository.deleteById(fileId);
        try {
            await publishFileEvent({
                eventType: EVENT_TYPES.FILE_DELETED,
                actorUserId: user.id,
                actorEmail: user.email,
                data: {
                    fileId: String(fileRecord._id),
                    storageKey: fileRecord.storageKey
                },
                requestId: String(requestId),
                key: String(fileId)
            });
        } catch (eventError) {
            console.error("Failed to publish event for file deletion:", eventError);
        }
        return {deleted : true};
    }
}

module.exports = new FileDeleteService();