const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoom: { type: String, required: true, index: true }, // 'userId_providerId'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 2000 },
  messageType: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
  isRead: { type: Boolean, default: false },
  bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
