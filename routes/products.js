const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// GET 所有商品
router.get('/', productController.getAllProducts);  // 改為 getAllProducts

// GET 單個商品
router.get('/:id', productController.getProductById);

// GET 根據類別獲取商品
router.get('/category/:category', productController.getProductsByCategory);

// POST 新增商品
router.post('/', auth, productController.createProduct);

// PUT 更新商品
router.put('/:id', auth, productController.updateProduct);

// DELETE 刪除商品
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;