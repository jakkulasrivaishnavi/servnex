const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews, addProviderReply } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createReview);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id/reply', protect, authorize('provider'), addProviderReply);

module.exports = router;
