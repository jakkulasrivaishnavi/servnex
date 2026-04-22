const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  tags: [String], // e.g., ['Professional', 'On time', 'Good work']
  providerReply: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

// After saving a review, update provider's average rating
reviewSchema.post('save', async function () {
  const Provider = require('./Provider');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { provider: this.provider } },
    { $group: { _id: '$provider', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Provider.findByIdAndUpdate(this.provider, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
