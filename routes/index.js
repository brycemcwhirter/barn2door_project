const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const checkoutController = require('../controllers/checkoutController');
const webhookController = require('../controllers/webhookController');
const orderController = require('../controllers/orderController');
const analyticsController = require('../controllers/analyticsController');

router.get('/products', productController.getProducts);
router.post('/checkout', checkoutController.startCheckout);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);
router.get('/orders', orderController.getOrders);
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
