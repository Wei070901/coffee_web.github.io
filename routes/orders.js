const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/', auth, orderController.getOrders);

router.get('/:id', auth, orderController.getOrderById);

router.post('/', auth, orderController.createOrder);

// 更新訂單狀態
router.patch('/:id/status', auth, orderController.updateOrderStatus);

// 取消訂單
router.patch('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;