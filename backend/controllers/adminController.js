const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProviders, pendingProviders, totalBookings, recentBookings, revenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments({ verificationStatus: 'approved' }),
      Provider.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name').populate({ path: 'provider', populate: { path: 'user', select: 'name' } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalBookings,
        totalRevenue: revenue[0]?.total || 0,
        recentBookings,
        bookingStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/providers/pending
exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/admin/providers/:id/verify
exports.verifyProvider = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, verificationNote: note },
      { new: true }
    ).populate('user', 'name email');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });
    res.json({ success: true, data: provider });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, total, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, total, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
