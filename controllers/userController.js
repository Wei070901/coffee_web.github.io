const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// 獲取所有用戶
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        data: users
    });
});

// 獲取單個用戶
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的用戶`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// 更新用戶資料
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的用戶`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// 刪除用戶
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的用戶`, 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
}); 