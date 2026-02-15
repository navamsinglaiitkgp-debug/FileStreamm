const UploadSession = require("../models/UploadSession");

class UploadSessionRepository {
    async create(sessionDoc) {
        return UploadSession.create(sessionDoc);
    }

    async findById(id) {
        return UploadSession.findById(id);
    }
    async findByIdAndOwner(id, ownerId) {
        return UploadSession.findOne({_id: id, ownerId});
    }

    async markChunkReceived({uploadId, chunkIndex, chunkHash, chunkSizeBytes}) {
        const update = {
            $addToSet: {
                receivedChunks: chunkIndex
            },
            $set: { status: "UPLOADING" }
        };
        if (chunkHash) {
            update.$set[`chunkHashes.${chunkIndex}`] = chunkHash;
        }
        const parsedSize =
            typeof chunkSizeBytes === "number"
                ? chunkSizeBytes
                : typeof chunkSizeBytes === "string"
                    ? Number(chunkSizeBytes)
                    : NaN;
        if (Number.isFinite(parsedSize)) {
            update.$set[`chunkSizes.${chunkIndex}`] = parsedSize;
        }
        return UploadSession.findByIdAndUpdate(uploadId, update, {new: true});
    }

    async setStatus(uploadId, status) {
        return UploadSession.findByIdAndUpdate(uploadId, { $set: { status } }, { new: true });
    }

    async setCompletion(uploadId, fileId, finalBucket, finalStorageKey) {
        return UploadSession.findByIdAndUpdate(uploadId, {
            $set: { 
                status: "COMPLETED",
                fileId,
                finalBucket,
                finalStorageKey
            } 
        }, { new: true });
    }
}

module.exports = new UploadSessionRepository();
