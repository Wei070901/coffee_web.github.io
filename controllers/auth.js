const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    註冊用戶
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    try {
        console.log('註冊請求數據:', req.body);
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return next(new ErrorResponse('所有欄位都是必填的', 400));
        }

        // 檢查是否已存在相同 email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('此電子郵件已被註冊', 400));
        }

        // 創建用戶
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        console.log('創建的用戶:', user);

        // 生成 token
        const token = user.getSignedJwtToken();

        return res.status(201).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                level: user.level,
                points: user.points
            }
        });
    } catch (error) {
        console.error('註冊詳細錯誤:', error);
        if (error.code === 11000) {
            return next(new ErrorResponse('此電子郵件已被註冊', 400));
        }
        return next(new ErrorResponse(error.message || '註冊失敗，請稍後再試', 500));
    }
});

// @desc    用戶登入
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 驗證是否有提供 email 和 password
    if (!email || !password) {
        return next(new ErrorResponse('請提供電子郵件和密碼', 400));
    }

    // 檢查用戶
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('無效的認證資訊', 401));
    }

    // 檢查密碼
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('無效的認證資訊', 401));
    }

    // 生成 token 並發送響應
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            level: user.level,
            points: user.points
        }
    });
});

// @desc    用戶登出
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    獲取當前用戶資料
// @route   GET /api/auth/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    更新用戶資料
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    記密碼
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('找不到此電子郵件的用戶', 404));
    }

    // 獲取重設密碼的 token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // 建立重設密碼的 url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // 發送重設密碼的郵件
    try {
        // TODO: 實作發送郵件的功能
        res.status(200).json({
            success: true,
            data: '重設密碼郵件已發送'
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('無法發送重設密碼郵件', 500));
    }
});

// @desc    重設密碼
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // TODO: 實作重設密碼功能
    res.status(200).json({
        success: true,
        data: '密碼已重設'
    });
});

// 產生 token 並發送 cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}; 