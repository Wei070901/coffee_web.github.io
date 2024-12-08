const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        name: String,
        phone: String,
        address: String,
        email: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit', 'transfer', 'cod']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true,
        default: 60
    },
    total: {
        type: Number,
        required: true
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// 生成訂單編號
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `${year}${month}${day}${random}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 