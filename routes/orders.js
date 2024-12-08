const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus
} = require('../controllers/orders');

// 所有訂單路由都需要認證
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router; 