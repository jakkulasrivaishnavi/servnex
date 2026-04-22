const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  serviceCategory: { type: String, required: true },
  skillRequired: { type: String, required: true },
  description: { type: String, maxlength: 1000 },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  address: {
    text: { type: String, required: true },
    lat: Number,
    lng: Number,
  },
  estimatedPrice: {
    min: Number,
    max: Number,
  },
  finalPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
  }],
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
  },
  hasReview: { type: Boolean, default: false },
  cancellationReason: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
    if (this.status === 'completed') this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
