const mongoose = require('mongoose');

const serviceCategories = {
  Electrician: ['Wiring', 'Fan Repair', 'Switchboard Fixing', 'AC Installation', 'MCB Repair', 'CCTV Installation'],
  Plumber: ['Pipe Repair', 'Tap Fixing', 'Bathroom Fitting', 'Water Tank Cleaning', 'Drain Cleaning'],
  Carpenter: ['Furniture Repair', 'Door Fitting', 'Cupboard Making', 'Wood Polishing'],
  Painter: ['Wall Painting', 'Waterproofing', 'Texture Painting', 'Exterior Painting'],
  Cleaner: ['Home Cleaning', 'Office Cleaning', 'Sofa Cleaning', 'Deep Cleaning'],
  ACTechnician: ['AC Installation', 'AC Service', 'AC Gas Refill', 'AC Repair'],
};

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  serviceCategory: {
    type: String,
    required: [true, 'Service category is required'],
    enum: Object.keys(serviceCategories),
  },
  skills: [{
    type: String,
    required: true,
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: 0,
    max: 50,
  },
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  liveLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '20:00' },
    },
    workingDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  completedJobs: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  bio: { type: String, maxlength: 500 },
  idProof: String, // Document upload path
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationNote: String,
  documents: [String],
  badges: [String], // e.g., 'Top Rated', 'Expert', 'Verified'
  createdAt: { type: Date, default: Date.now },
});

// 2dsphere index for geospatial queries
providerSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for distance (populated in queries)
providerSchema.virtual('distance').get(function () {
  return this._distance;
});

module.exports = mongoose.model('Provider', providerSchema);
module.exports.serviceCategories = serviceCategories;
