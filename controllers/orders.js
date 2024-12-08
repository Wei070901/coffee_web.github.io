const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    創建訂單
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    const {
        items,
        shippingAddress,
        paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
        return next(new ErrorResponse('請選擇商品', 400));
    }

    // 計算訂單金額
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(new ErrorResponse('商品不存在', 404));
        }

        // 檢查庫存
        if (product.stock < item.quantity) {
            return next(new ErrorResponse(`商品 ${product.name} 庫存不足`, 400));
        }

        subtotal += product.price * item.quantity;
        orderItems.push({
            product: item.product,
            quantity: item.quantity,
            price: product.price
        });

        // 更新庫存
        product.stock -= item.quantity;
        await product.save();
    }

    const shippingFee = 60; // 固定運費
    const total = subtotal + shippingFee;

    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
        statusHistory: [{
            status: 'processing'
        }]
    });

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