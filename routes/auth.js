const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');

// 公開路由
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 需要認證的路由
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router; 