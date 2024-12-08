const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/wishlist');

router.use(protect);

router.route('/')
    .get(getWishlist)
    .post(addToWishlist);

router.route('/:productId')
    .delete(removeFromWishlist);

module.exports = router; 