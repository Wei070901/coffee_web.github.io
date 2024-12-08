const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '請輸入姓名']
    },
    email: {
        type: String,
        required: [true, '請輸入電子郵件'],
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            '請輸入有效的電子郵件'
        ]
    },
    phone: {
        type: String,
        required: [true, '請輸入電話號碼']
    },
    subject: {
        type: String,
        required: [true, '請輸入主旨']
    },
    message: {
        type: String,
        required: [true, '請輸入訊息內容']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema); 