const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;
