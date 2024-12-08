const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getOrderById
} = require('../controllers/orders');

router.use(protect);  // 所有訂單路由都需要登入

router.route('/')
    .post(createOrder);

router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router; 