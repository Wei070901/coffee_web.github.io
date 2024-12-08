const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    獲取所有商品
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    // 複製 req.query
    const reqQuery = { ...req.query };

    // 要排除的欄位
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // 建立查詢字串
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // 找出商品
    let query = Product.find(JSON.parse(queryStr));

    // Select 欄位
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // 排序
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // 分頁
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // 執行查詢
    const products = await query;

    // 分頁結果
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products
    });
});

// @desc    獲取單一商品
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的商品`, 404));
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    創建商品
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    更新商品
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的商品`, 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    刪除商品
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`找不到 ID 為 ${req.params.id} 的商品`, 404));
    }

    await product.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    獲取相關商品
// @route   GET /api/products/related/:id
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse('找不到此商品', 404));
    }

    // 根據相同類別或烘焙程度找出相關商品
    const relatedProducts = await Product.find({
        $and: [
            { _id: { $ne: product._id } },  // 排除當前商品
            {
                $or: [
                    { category: product.category },
                    { roastLevel: product.roastLevel }
                ]
            }
        ]
    }).limit(3);  // 限制返回3個相關商品

    // 如果找不到足夠的相關商品，就隨機選擇其他商品補足
    if (relatedProducts.length < 3) {
        const remainingCount = 3 - relatedProducts.length;
        const otherProducts = await Product.find({
            _id: { 
                $ne: product._id,
                $nin: relatedProducts.map(p => p._id)
            }
        }).limit(remainingCount);

        relatedProducts.push(...otherProducts);
    }

    res.status(200).json({
        success: true,
        data: relatedProducts
    });
}); 