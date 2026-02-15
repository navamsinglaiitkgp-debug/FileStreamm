const router = require('express').Router();
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const adminController = require('../controllers/adminController');

// Admin-only route to get all users
router.get('/admin/users', authMiddleware, requireRole("admin"), adminController.getAllUsers);

module.exports = router;