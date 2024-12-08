const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    創建訂單
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    // 添加用戶ID到訂單數據
    req.body.user = req.user.id;

    // 生成訂單編號 (格式: CF + 年月日 + 4位隨機數)
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    req.body.orderNumber = `CF${year}${month}${day}${random}`;

    // 確保所有必要欄位都存在
    const orderData = {
        orderNumber: req.body.orderNumber,
        user: req.body.user,
        items: req.body.items,
        shippingInfo: {
            name: req.body.shippingInfo.name,
            phone: req.body.shippingInfo.phone,
            email: req.body.shippingInfo.email,
            address: req.body.shippingInfo.address
        },
        paymentMethod: req.body.paymentMethod,
        totalAmount: req.body.totalAmount,
        subtotal: req.body.subtotal,
        shippingFee: req.body.shippingFee || 60,
        status: 'pending'
    };

    console.log('Creating order with data:', orderData);

    const order = await Order.create(orderData);

    res.status(201).json({
        success: true,
        data: order
    });
});

// @desc    獲取用戶所有訂單
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
        .populate('items.product', 'name images')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    獲取單一訂單
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name images');

    if (!order) {
        return next(new ErrorResponse('找不到此訂單', 404));
    }

    // 確認是否為訂單擁有者
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('無權限查看此訂單', 401));
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    更新訂單狀態
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('找不到此訂單', 404));
    }

    order.orderStatus = status;
    order.statusHistory.push({
        status,
        timestamp: Date.now()
    });

    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    更新付款狀態
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('找不到此訂單', 404));
    }

    order.paymentStatus = status;
    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
}); 