const FileRepository = require('../repositories/fileRepository');

exports.listMyFiles = async (req , res, next) => {
    try {
        const ownerId = req.user.id;
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const skip = Number(req.query.skip) ; 
        const [total, files] = await Promise.all([
            FileRepository.countByOwner(ownerId),
            FileRepository.findByOwner(ownerId, { limit, skip })
        ]);
        
        res.status(200).json({ success: true, paging: {total, limit, skip}, files });
    } catch (error) {
        next(error);
    }
};