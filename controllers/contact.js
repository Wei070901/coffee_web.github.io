const Contact = require('../models/Contact');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    創建聯絡表單
// @route   POST /api/contact
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
    console.log('Received contact form data:', req.body);
    
    const contact = await Contact.create(req.body);

    res.status(201).json({
        success: true,
        data: contact
    });
});

// @desc    獲取所有聯絡表單
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res, next) => {
    const contacts = await Contact.find().sort('-createdAt');

    res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts
    });
}); 