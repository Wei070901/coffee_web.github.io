const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { registerValidator } = require('../middleware/validators');
const validate = require('../middleware/validate');

// 登入驗證規則
const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('請輸入有效的電子郵件地址'),
    body('password')
        .notEmpty()
        .withMessage('請輸入密碼')
];

// 註冊路由
router.post('/register', registerValidator, validate, authController.register);

// 登入路由
router.post('/login', loginValidator, validate, authController.login);

module.exports = router;