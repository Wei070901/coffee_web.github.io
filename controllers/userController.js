const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 獲取用戶資料
exports.getProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// 更新用戶資料
exports.updateProfile = catchAsync(async (req, res, next) => {
    // 不允許在此更新密碼
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('此路由不用於密碼更新。請使用 /updatePassword', 400));
    }

    // 過濾不允許更新的欄位
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone');

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// 更改密碼
exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, passwordConfirm } = req.body;

    // 1) 獲取用戶
    const user = await User.findById(req.user.id).select('+password');

    // 2) 檢查當前密碼是否正確
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('當前密碼不正確', 401));
    }

    // 3) 更新密碼
    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: '密碼更新成功'
    });
});

// 刪除帳號
exports.deleteAccount = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// 輔助函數：過濾對象屬性
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};