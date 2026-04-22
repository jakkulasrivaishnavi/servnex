const express = require('express');
const router = express.Router();
const {
  createBooking, getUserBookings, getProviderBookings, getBooking, updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('user'), createBooking);
router.get('/user', getUserBookings);
router.get('/provider', authorize('provider'), getProviderBookings);
router.get('/:id', getBooking);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
