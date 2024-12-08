const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 註冊
exports.register = async (req, res) => {
    try {
        const { username, email, password, phone, address } = req.body;

        // 檢查用戶是否已存在
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: '用戶名或電子郵件已被使用' 
            });
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);

        // 創建新用戶
        const user = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            address
        });

        await user.save();

        // 生成 JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: '註冊成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 登入
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 查找用戶
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: '電子郵件或密碼錯誤' });
        }

        // 驗證密碼
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: '電子郵件或密碼錯誤' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: '登入成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};