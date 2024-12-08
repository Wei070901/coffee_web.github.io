const express = require('express');
const router = express.Router();

const auth = require('./auth');
const products = require('./products');
const cart = require('./cart');
const orders = require('./orders');
const contact = require('./contact');

router.use('/auth', auth);
router.use('/products', products);
router.use('/cart', cart);
router.use('/orders', orders);
router.use('/contact', contact);

module.exports = router; 