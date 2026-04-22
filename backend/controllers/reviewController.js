const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, tags } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings.' });
    if (booking.hasReview) return res.status(400).json({ success: false, message: 'Already reviewed.' });

    const review = await Review.create({
      booking: bookingId,
      user: req.user.id,
      provider: booking.provider,
      rating,
      comment,
      tags,
    });

    await Booking.findByIdAndUpdate(bookingId, { hasReview: true });
    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/reviews/provider/:providerId
exports.getProviderReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ provider: req.params.providerId });
    res.json({ success: true, total, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/reviews/:id/reply
exports.addProviderReply = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('provider');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.provider.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    review.providerReply = req.body.reply;
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
