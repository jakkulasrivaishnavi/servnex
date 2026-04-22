const express = require('express');
const router = express.Router();
const {
  getDashboard, getPendingProviders, verifyProvider,
  getAllUsers, toggleUser, getAllBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/verify', verifyProvider);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/bookings', getAllBookings);

module.exports = router;
