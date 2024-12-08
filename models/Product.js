const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['light', 'medium', 'dark'],
        required: true
    },
    roastLevel: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    features: [{
        type: String
    }],
    brewingGuide: [{
        type: String
    }],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 