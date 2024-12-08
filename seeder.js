const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// 檢查 MONGO_URI
console.log('MONGO_URI:', process.env.MONGO_URI);

// 載入模型
const Product = require('./models/Product');
const User = require('./models/User');

// 連接到 MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coffee-shop', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...'.cyan.underline);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// 讀取 JSON 文件
const products = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'products.json'), 'utf-8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8'));

// 導入數據
const importData = async () => {
    try {
        await connectDB();
        await Product.create(products);
        await User.create(users);
        
        console.log('數據導入成功！'.green.inverse);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

// 刪除數據
const deleteData = async () => {
    try {
        await connectDB();
        await Product.deleteMany();
        await User.deleteMany();
        
        console.log('數據刪除成功！'.red.inverse);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
} else {
    console.log('請使用 -i (導入) 或 -d (刪除) 參數'.yellow);
    process.exit(1);
} 