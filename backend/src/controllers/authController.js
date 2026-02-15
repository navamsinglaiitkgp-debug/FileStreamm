const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

function signToken (user) {
    return jwt.sign(
        {email: user.email, role: user.role},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            subject: String(user._id)
        }
    );
}

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already in use', 409, 'EMAIL_IN_USE');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ email, passwordHash });
        await user.save();
        const token = signToken(user);
        res.status(201).json({ success: true, token, user:{
            id: String(user._id),
            email: user.email,
            role: user.role
        } });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Invalid email or password', 401, 'AUTH_FAILED');
        }
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            throw new AppError('Invalid email or password', 401, 'AUTH_FAILED');
        }
        const token = signToken(user);
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
};