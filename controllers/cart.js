const Cart = require('../models/Cart');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    獲取購物車
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name price images');

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: []
        });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    新增商品到購物車
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;

    // 檢查是否已有購物車
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        // 創建新購物車
        cart = await Cart.create({
            user: req.user.id,
            items: [{ product: productId, quantity }]
        });
    } else {
        // 檢查商品是否已在購物車中
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // 更新數量
            cart.items[itemIndex].quantity += quantity;
        } else {
            // 添加新商品
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    更新購物車商品數量
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new ErrorResponse('購物車不存在', 404));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
        return next(new ErrorResponse('商品不存在於購物車中', 404));
    }

    // 檢查庫存
    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
        return next(new ErrorResponse('商品庫存不足', 400));
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    從購物車移除商品
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new ErrorResponse('購物車不存在', 404));
    }

    cart.items = cart.items.filter(
        item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    清空購物車
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new ErrorResponse('購物車不存在', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
}); 