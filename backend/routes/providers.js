const express = require('express');
const router = express.Router();
const {
  createProfile, updateProfile, searchProviders, getProvider,
  getMyProfile, updateAvailability, updateLiveLocation, getCategories, getTopProviders
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/search', searchProviders);
router.get('/top', getTopProviders);
router.get('/me', protect, authorize('provider', 'admin'), getMyProfile);
router.post('/profile', protect, createProfile);
router.put('/profile', protect, authorize('provider'), updateProfile);
router.put('/availability', protect, authorize('provider'), updateAvailability);
router.put('/live-location', protect, authorize('provider'), updateLiveLocation);
router.get('/:id', getProvider);

module.exports = router;
