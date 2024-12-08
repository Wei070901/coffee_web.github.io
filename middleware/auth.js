const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// 保護路由
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // 從 header 取得 token
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // 從 cookie 取得 token
        token = req.cookies.token;
    }

    // 確認 token 存在
    if (!token) {
        return next(new ErrorResponse('未授權的存取', 401));
    }

    try {
        // 驗證 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('未授權的存取', 401));
    }
});

// 授權角色
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `用戶角色 ${req.user?.role || '未知'} 未被授權存取此資源`,
                    403
                )
            );
        }
        next();
    };
}; 