const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    獲取收藏清單
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
    console.log('獲取收藏清單的用戶:', req.user.id);
    const user = await User.findById(req.user.id).populate('wishlist');
    console.log('用戶的收藏清單:', user.wishlist);

    res.status(200).json({
        success: true,
        data: user.wishlist
    });
});

// @desc    添加商品到收藏清單
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return next(new ErrorResponse('找不到此商品', 404));
    }

    // 檢查商品是否已在收藏清單中
    if (user.wishlist.includes(req.params.productId)) {
        return next(new ErrorResponse('此商品已在收藏清單中', 400));
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    res.status(200).json({
        success: true,
        message: '已加入收藏清單',
        data: user.wishlist
    });
});

// @desc    從收藏清單移除商品
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // 檢查商品是否在收藏清單中
    if (!user.wishlist.includes(req.params.productId)) {
        return next(new ErrorResponse('此商品不在收藏清單中', 404));
    }

    user.wishlist = user.wishlist.filter(
        id => id.toString() !== req.params.productId
    );
    
    await user.save();

    res.status(200).json({
        success: true,
        message: '已從收藏清單移除',
        data: user.wishlist
    });
}); 