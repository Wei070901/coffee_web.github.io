const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 所有方法都使用 Mongoose
exports.getAllProducts = catchAsync(async (req, res) => {
    const products = await Product.find();
    
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return next(new AppError('找不到該商品', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

exports.createProduct = catchAsync(async (req, res, next) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            product
        }
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!product) {
        return next(new AppError('找不到該商品', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError('找不到該商品', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
    const products = await Product.find({ category: req.params.category });

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});