const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-passwordHash'); // Exclude password hash
        res.status(200).json({ success: true, users });
    } catch (err) {
        next(err);
    }
};
