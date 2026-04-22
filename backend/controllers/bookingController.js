const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const provider = await Provider.findById(req.body.provider);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });
    if (provider.verificationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Provider is not verified.' });
    }

    const booking = await Booking.create({
      ...req.body,
      user: req.user.id,
      estimatedPrice: provider.priceRange,
      serviceCategory: provider.serviceCategory,
    });

    await booking.populate([
      { path: 'user', select: 'name phone email' },
      { path: 'provider', populate: { path: 'user', select: 'name phone' } },
    ]);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/bookings/user — User's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate({ path: 'provider', populate: { path: 'user', select: 'name phone avatar' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ success: true, total, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/bookings/provider — Provider's bookings
exports.getProviderBookings = async (req, res) => {
  try {
    const providerProfile = await Provider.findOne({ user: req.user.id });
    if (!providerProfile) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { provider: providerProfile._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name phone email avatar location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Stats
    const stats = await Booking.aggregate([
      { $match: { provider: providerProfile._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, total, data: bookings, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email avatar')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('payment');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Check ownership
    const isUser = booking.user._id.toString() === req.user.id;
    const providerProfile = await Provider.findOne({ user: req.user.id });
    const isProvider = providerProfile && booking.provider._id.toString() === providerProfile._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/bookings/:id/status — Provider accepts/rejects
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, note, finalPrice } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const providerProfile = await Provider.findOne({ user: req.user.id });
    const isProvider = providerProfile && booking.provider.toString() === providerProfile._id.toString();
    const isUser = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Provider can accept/reject/start/complete
    // User can cancel
    const allowedByProvider = ['accepted', 'rejected', 'in_progress', 'completed'];
    const allowedByUser = ['cancelled'];

    if (isProvider && !allowedByProvider.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for provider.' });
    }
    if (isUser && !allowedByUser.includes(status)) {
      return res.status(400).json({ success: false, message: 'Users can only cancel bookings.' });
    }
    if (!isProvider && !isUser && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    booking.status = status;
    if (note) booking.cancellationReason = note;
    if (finalPrice) booking.finalPrice = finalPrice;
    if (status === 'completed') {
      await Provider.findByIdAndUpdate(providerProfile._id, {
        $inc: { completedJobs: 1, totalEarnings: finalPrice || booking.estimatedPrice?.min || 0 },
      });
    }
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
