const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '商品名稱為必填'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, '商品價格為必填'],
        min: [0, '價格不能小於0']
    },
    description: {
        type: String,
        required: [true, '商品描述為必填']
    },
    image: {
        type: String,
        required: [true, '商品圖片為必填']
    },
    category: {
        type: String,
        required: [true, '商品類別為必填'],
        enum: ['咖啡豆', '濾掛包', '咖啡器具', '禮盒組']
    },
    roastLevel: {
        type: String,
        enum: ['淺焙', '中焙', '中深焙', '深焙'],
        required: function() {
            return this.category === '咖啡豆' || this.category === '濾掛包';
        }
    },
    features: [{
        type: String,
        trim: true
    }],
    brewingGuide: {
        type: Map,
        of: String
    },
    stock: {
        type: Number,
        required: [true, '庫存數量為必填'],
        min: [0, '庫存不能小於0']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', productSchema);