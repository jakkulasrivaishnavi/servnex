const Provider = require('../models/Provider');
const User = require('../models/User');

// Haversine formula to calculate distance in km
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @POST /api/providers/profile
exports.createProfile = async (req, res) => {
  try {
    const existing = await Provider.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Provider profile already exists.' });

    const provider = await Provider.create({ ...req.body, user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { role: 'provider' });
    res.status(201).json({ success: true, provider });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/providers/profile
exports.updateProfile = async (req, res) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/providers/search — Main search with filters
exports.searchProviders = async (req, res) => {
  try {
    const { serviceCategory, skill, lat, lng, radius = 10, minRating, maxPrice, page = 1, limit = 20, sort = 'rating' } = req.query;

    const filter = { verificationStatus: 'approved', 'availability.isAvailable': true };
    if (serviceCategory) filter.serviceCategory = serviceCategory;
    if (skill) filter.skills = { $in: [skill] };
    if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };
    if (maxPrice) filter['priceRange.min'] = { $lte: parseFloat(maxPrice) };

    let providers = await Provider.find(filter)
      .populate('user', 'name email phone avatar')
      .lean();

    // Calculate distances and filter by radius
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      providers = providers
        .map(p => ({ ...p, distance: getDistance(userLat, userLng, p.location.lat, p.location.lng) }))
        .filter(p => p.distance <= parseFloat(radius))
        .sort((a, b) => {
          if (sort === 'distance') return a.distance - b.distance;
          if (sort === 'rating') return b.rating.average - a.rating.average;
          if (sort === 'price') return a.priceRange.min - b.priceRange.min;
          return 0;
        });
    }

    const total = providers.length;
    const start = (page - 1) * limit;
    const paginated = providers.slice(start, start + parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/providers/:id
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('user', 'name email phone avatar createdAt');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });
    res.json({ success: true, data: provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/providers/me
exports.getMyProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    res.json({ success: true, data: provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/providers/availability
exports.updateAvailability = async (req, res) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { user: req.user.id },
      { availability: req.body },
      { new: true }
    );
    res.json({ success: true, availability: provider.availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/providers/live-location
exports.updateLiveLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await Provider.findOneAndUpdate(
      { user: req.user.id },
      { liveLocation: { lat, lng, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Location updated.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/providers/categories
exports.getCategories = async (req, res) => {
  const { serviceCategories } = require('../models/Provider');
  res.json({ success: true, data: serviceCategories });
};

// @GET /api/providers/top — AI-based recommendations
exports.getTopProviders = async (req, res) => {
  try {
    const { lat, lng, serviceCategory } = req.query;
    const filter = { verificationStatus: 'approved', 'availability.isAvailable': true, 'rating.count': { $gte: 1 } };
    if (serviceCategory) filter.serviceCategory = serviceCategory;

    let providers = await Provider.find(filter)
      .populate('user', 'name avatar')
      .lean()
      .limit(50);

    if (lat && lng) {
      providers = providers.map(p => ({
        ...p,
        distance: getDistance(parseFloat(lat), parseFloat(lng), p.location.lat, p.location.lng),
        // Recommendation score: rating * 0.5 + completedJobs * 0.3 + (1/distance) * 0.2
        score: (p.rating.average * 0.5) + (Math.min(p.completedJobs, 50) / 50 * 0.3) + (1 / (p.distance || 1) * 0.2),
      }));
      providers = providers.filter(p => p.distance <= 20).sort((a, b) => b.score - a.score).slice(0, 10);
    } else {
      providers = providers.sort((a, b) => b.rating.average - a.rating.average).slice(0, 10);
    }

    res.json({ success: true, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
