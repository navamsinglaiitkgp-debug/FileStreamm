const router = require('express').Router();
const authMiddleware = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/auth/me', authMiddleware, userController.me);

module.exports = router;