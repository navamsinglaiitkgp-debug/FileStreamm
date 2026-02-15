const fs = require("fs");
const AppError = require("../utils/AppError");
const UploadSessionRepository = require("../repositories/uploadSessionRepository");
const storageService = require("../services/storageService");

exports.uploadChunk = async (req, res, next) => {
    try {
        const {uploadId, chunkIndex} = req.params;
        if (!uploadId || typeof uploadId !== "string") {
            throw new AppError("uploadId is required and must be a string", 400, "BAD_REQUEST");
        }
        const index = Number(chunkIndex);
        if (isNaN(index) || index < 0) {
            throw new AppError("chunkIndex must be a non-negative number", 400, "BAD_REQUEST");
        }
        const session = await UploadSessionRepository.findById(uploadId);
        if (!session) {
            throw new AppError("Upload session not found", 404, "NOT_FOUND");
        }
        if (session.ownerId.toString() !== req.user.id) {
            throw new AppError("You do not have permission to upload to this session", 403, "FORBIDDEN");
        }
        if(session.status === "COMPLETED") {
            throw new AppError("Cannot upload chunk to a completed session", 400, "BAD_REQUEST");
        }
        if (index >= session.totalChunks) {
            throw new AppError("chunkIndex exceeds totalChunks for this session", 400, "BAD_REQUEST");
        }
        if (!req.file) {
            throw new AppError("No file provided", 400, "BAD_REQUEST");
        }
        const chunkKey = `uploads/${uploadId}/chunks/${index}`;
        const chunkHash = req.headers['x-chunk-hash'];
        const existingHash = session.chunkHashes?.get(index.toString());
        if(existingHash && chunkHash && existingHash !== chunkHash) {
            throw new AppError("Chunk hash does not match previously uploaded chunk", 400, "BAD_REQUEST");
        }
        const buffer = fs.readFileSync(req.file.path);
        await storageService.uploadBuffer({
            buffer,
            key: chunkKey,
            contentType: "application/octet-stream"
        });
        const updated = await UploadSessionRepository.markChunkReceived({uploadId, chunkIndex: index, chunkHash: chunkHash?String(chunkHash):undefined, chunkSizeBytes: req.file.size});
        res.status(200).json({ 
            success: true, uploadId,
            chunkIndex: index,
            totalChunks: updated.totalChunks,
            receivedChunks: updated.receivedChunks.length,
            status: updated.status
        });  
    } catch (error) {
        next(error);
    } finally {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
    }
};