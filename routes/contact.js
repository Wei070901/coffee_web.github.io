const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createContact,
    getContacts
} = require('../controllers/contact');

// 這個路由不需要 auth 中間件
router.post('/', createContact);

// 這個路由需要 auth 中間件
router.get('/', protect, authorize('admin'), getContacts);

module.exports = router; 