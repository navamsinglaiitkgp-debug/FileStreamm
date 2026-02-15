const File = require('../models/File');

class FileRepository {
    async create(fileDoc) {
        return File.create(fileDoc);
    }
    async findById(id) {
        return File.findById(id);
    }
    async findByStorageKey(storageKey) {
        return File.findOne({ storageKey });
    }
    async findByOwner(ownerId, {limit=20, skip=0} = {}) {
        return File.find({ ownerId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    async countByOwner(ownerId) {
        return File.countDocuments({ ownerId });
    }
    async deleteById(id) {
        return File.findByIdAndDelete(id);
    }
}

module.exports = new FileRepository();