const express = require('express');
const router = express.Router();
const hummController = require('../controllers/hummController');

// Initiate a Humm payment session
router.post('/initiate', hummController.initiatePayment);

// Callback that Humm redirects to after payment completion/cancellation
router.get('/callback', hummController.handleCallback);

// Refund a Humm payment
router.post('/refund', hummController.refundPayment);

// Get current payment status
router.post('/status', hummController.getPaymentStatus);

module.exports = router;
