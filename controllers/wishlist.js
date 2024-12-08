const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    獲取用戶收藏清單
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
        .populate('items.product');

    res.status(200).json({
        success: true,
        data: wishlist ? wishlist.items : []
    });
});

// @desc    添加商品到收藏清單
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: req.user.id,
            items: [{ product: req.body.productId }]
        });
    } else {
        // 檢查商品是否已在收藏清單中
        const existingItem = wishlist.items.find(
            item => item.product.toString() === req.body.productId
        );

        if (!existingItem) {
            wishlist.items.push({ product: req.body.productId });
            await wishlist.save();
        }
    }

    res.status(200).json({
        success: true,
        data: wishlist
    });
});

// @desc    從收藏清單移除商品
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        return next(new ErrorResponse('找不到收藏清單', 404));
    }

    wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== req.params.productId
    );

    await wishlist.save();

    res.status(200).json({
        success: true,
        data: wishlist
    });
}); 