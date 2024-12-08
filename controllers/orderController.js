const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 獲取用戶的所有訂單
exports.getOrders = catchAsync(async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
        .populate('items.product')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    });
});

// 獲取單個訂單
exports.getOrderById = catchAsync(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id
    }).populate('items.product');

    if (!order) {
        return res.status(404).json({
            status: 'fail',
            message: '找不到該訂單'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// 創建訂單
exports.createOrder = catchAsync(async (req, res) => {
    // 添加用戶ID到訂單數據
    const orderData = {
        ...req.body,
        user: req.user.id
    };

    const order = await Order.create(orderData);

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

// 更新訂單狀態
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const order = await Order.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user.id
        },
        { status: req.body.status },
        {
            new: true,
            runValidators: true
        }
    );

    if (!order) {
        return next(new AppError('找不到該訂單', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// 取消訂單
exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user.id,
            status: 'PENDING' // 只能取消待處理的訂單
        },
        { status: 'CANCELLED' },
        {
            new: true,
            runValidators: true
        }
    );

    if (!order) {
        return next(new AppError('無法取消該訂單', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});