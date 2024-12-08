const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Wishlist', WishlistSchema); 