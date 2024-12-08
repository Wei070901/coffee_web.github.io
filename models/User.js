const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '請提供姓名']
    },
    email: {
        type: String,
        required: [true, '請提供電子郵件'],
        unique: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            '請提供有效的電子郵件'
        ]
    },
    password: {
        type: String,
        required: [true, '請提供密碼'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, '請提供手機號碼'],
        match: [/^09\d{8}$/, '請提供有效的手機號碼']
    },
    address: String,
    points: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        enum: ['一般會員', 'VIP會員', '白金會員'],
        default: '一般會員'
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// 移除舊的索引
userSchema.index({ username: 1 }, { unique: true, sparse: true });

// 密碼加密中間件
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 驗證密碼方法
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 生成 JWT 的方法
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 