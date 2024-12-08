const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 獲取用戶資料
router.get('/profile', auth, userController.getProfile);

// 更新用戶資料
router.put('/profile', auth, userController.updateProfile);

// 更改密碼
router.patch('/password', auth, userController.updatePassword);

// 刪除帳號
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;