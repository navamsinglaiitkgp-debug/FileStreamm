const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const storageService = require("./storageService");
const fileRepository = require("../repositories/fileRepository");
const AppError = require("../utils/AppError");

class FileService {
    async uploadSingleFile(user, file) {
        if (!file) {
        throw new AppError("No file provided", 400, "BAD_REQUEST");
        }
        const ext = path.extname(file.originalname);
        const random = crypto.randomBytes(16).toString("hex");
        const storageKey = `users/${user.id}/${Date.now()}-${random}${ext}`;
        try {
            const buffer = fs.readFileSync(file.path);
            await storageService.uploadBuffer({
                buffer,
                key: storageKey,
                contentType: file.mimetype
            });
            const fileRecord = await fileRepository.create({
                ownerId: user.id,
                originalName: file.originalname,
                sizeBytes: file.size,
                contentType: file.mimetype,
                storageKey,
                bucket: process.env.S3_BUCKET,
                status:"READY"
            });
            return fileRecord;
        } catch (error) {
            try {
                await storageService.deleteObject({key: storageKey});
            } catch {}
            throw error;
        } finally {
            fs.unlink(file.path, () => {});
        }
    }
};

module.exports = new FileService();