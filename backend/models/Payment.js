const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
  },
  paymentMethod: String, // 'card', 'upi', 'netbanking', 'wallet'
  refundId: String,
  refundAmount: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

module.exports = mongoose.model('Payment', paymentSchema);
