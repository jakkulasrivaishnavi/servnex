/**
 * SkillBridge Database Seeder
 * Run: node seeder.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Provider = require('./models/Provider');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge';

const users = [
  { name: 'Admin User', email: 'admin@demo.com', phone: '9000000001', password: 'demo123', role: 'admin' },
  { name: 'Priya Sharma', email: 'user@demo.com', phone: '9000000002', password: 'demo123', role: 'user', location: { address: 'Anna Nagar, Chennai', lat: 13.0827, lng: 80.2707 } },
  { name: 'Karthik Rajan', email: 'user2@demo.com', phone: '9000000003', password: 'demo123', role: 'user', location: { address: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 } },
  { name: 'Suresh Electrician', email: 'provider@demo.com', phone: '9000000004', password: 'demo123', role: 'provider' },
  { name: 'Murugan Plumber', email: 'plumber@demo.com', phone: '9000000005', password: 'demo123', role: 'provider' },
  { name: 'Ramesh Carpenter', email: 'carpenter@demo.com', phone: '9000000006', password: 'demo123', role: 'provider' },
  { name: 'Sanjay Painter', email: 'painter@demo.com', phone: '9000000007', password: 'demo123', role: 'provider' },
  { name: 'Arjun Cleaner', email: 'cleaner@demo.com', phone: '9000000008', password: 'demo123', role: 'provider' },
];

const providerProfiles = [
  {
    email: 'provider@demo.com',
    serviceCategory: 'Electrician',
    skills: ['Wiring', 'Fan Repair', 'Switchboard Fixing', 'AC Installation'],
    experience: 8,
    priceRange: { min: 300, max: 1500 },
    location: { address: 'Adyar, Chennai', lat: 13.0012, lng: 80.2565 },
    bio: 'Certified electrician with 8 years of experience in residential and commercial electrical work. Specialized in AC installations and complete wiring jobs.',
    verificationStatus: 'approved',
    rating: { average: 4.7, count: 42 },
    completedJobs: 112,
    totalEarnings: 145000,
    badges: ['Top Rated', 'Expert'],
    availability: { isAvailable: true, workingHours: { start: '08:00', end: '20:00' }, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  },
  {
    email: 'plumber@demo.com',
    serviceCategory: 'Plumber',
    skills: ['Pipe Repair', 'Tap Fixing', 'Bathroom Fitting', 'Water Tank Cleaning'],
    experience: 5,
    priceRange: { min: 250, max: 1200 },
    location: { address: 'Velachery, Chennai', lat: 12.9753, lng: 80.2202 },
    bio: 'Experienced plumber handling all types of plumbing issues quickly and cleanly.',
    verificationStatus: 'approved',
    rating: { average: 4.5, count: 28 },
    completedJobs: 75,
    totalEarnings: 82000,
    availability: { isAvailable: true, workingHours: { start: '09:00', end: '19:00' }, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  },
  {
    email: 'carpenter@demo.com',
    serviceCategory: 'Carpenter',
    skills: ['Furniture Repair', 'Door Fitting', 'Cupboard Making', 'Wood Polishing'],
    experience: 12,
    priceRange: { min: 400, max: 3000 },
    location: { address: 'Tambaram, Chennai', lat: 12.9252, lng: 80.1273 },
    bio: 'Master carpenter with 12 years experience. Specializing in custom furniture and precision woodwork.',
    verificationStatus: 'approved',
    rating: { average: 4.8, count: 56 },
    completedJobs: 180,
    totalEarnings: 340000,
    badges: ['Top Rated', 'Expert', 'Verified'],
    availability: { isAvailable: true, workingHours: { start: '08:00', end: '18:00' }, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  },
  {
    email: 'painter@demo.com',
    serviceCategory: 'Painter',
    skills: ['Wall Painting', 'Waterproofing', 'Texture Painting'],
    experience: 7,
    priceRange: { min: 500, max: 5000 },
    location: { address: 'Porur, Chennai', lat: 13.0351, lng: 80.1574 },
    bio: 'Professional painter providing quality wall painting and waterproofing solutions.',
    verificationStatus: 'approved',
    rating: { average: 4.3, count: 19 },
    completedJobs: 45,
    totalEarnings: 95000,
    availability: { isAvailable: false, workingHours: { start: '09:00', end: '17:00' }, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  },
  {
    email: 'cleaner@demo.com',
    serviceCategory: 'Cleaner',
    skills: ['Home Cleaning', 'Deep Cleaning', 'Sofa Cleaning'],
    experience: 3,
    priceRange: { min: 200, max: 800 },
    location: { address: 'Sholinganallur, Chennai', lat: 12.9010, lng: 80.2279 },
    bio: 'Professional cleaning services for homes and offices. We bring our own equipment.',
    verificationStatus: 'pending',
    rating: { average: 0, count: 0 },
    completedJobs: 0,
    availability: { isAvailable: true, workingHours: { start: '07:00', end: '19:00' }, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Provider.deleteMany(), Booking.deleteMany(), Review.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Create users
  const createdUsers = {};
  for (const u of users) {
    const user = await User.create(u);
    createdUsers[u.email] = user;
  }
  console.log(`✅ Created ${users.length} users`);

  // Create provider profiles
  for (const p of providerProfiles) {
    const user = createdUsers[p.email];
    if (!user) continue;
    const { email, ...profileData } = p;
    await Provider.create({ ...profileData, user: user._id });
  }
  console.log(`✅ Created ${providerProfiles.length} provider profiles`);

  // Create sample bookings
  const userPriya = createdUsers['user@demo.com'];
  const userKarthik = createdUsers['user2@demo.com'];
  const provSuresh = await Provider.findOne({ serviceCategory: 'Electrician' });
  const provMurugan = await Provider.findOne({ serviceCategory: 'Plumber' });

  if (userPriya && provSuresh) {
    await Booking.create({
      user: userPriya._id, provider: provSuresh._id,
      serviceCategory: 'Electrician', skillRequired: 'Fan Repair',
      description: 'Ceiling fan not working at full speed, making noise',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledTime: '10:00 AM',
      address: { text: 'Flat 304, Sunrise Apartments, Anna Nagar, Chennai', lat: 13.0827, lng: 80.2707 },
      estimatedPrice: { min: 300, max: 1500 },
      status: 'accepted',
      statusHistory: [{ status: 'pending' }, { status: 'accepted' }],
    });

    await Booking.create({
      user: userPriya._id, provider: provSuresh._id,
      serviceCategory: 'Electrician', skillRequired: 'Wiring',
      description: 'New house wiring needed for 3BHK',
      scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      scheduledTime: '09:00 AM',
      address: { text: 'New Villa, ECR Road, Chennai', lat: 12.9716, lng: 80.2711 },
      estimatedPrice: { min: 1000, max: 3000 },
      finalPrice: 2200,
      status: 'completed',
      paymentStatus: 'paid',
      hasReview: true,
      statusHistory: [{ status: 'pending' }, { status: 'accepted' }, { status: 'in_progress' }, { status: 'completed' }],
    });
  }

  if (userKarthik && provMurugan) {
    await Booking.create({
      user: userKarthik._id, provider: provMurugan._id,
      serviceCategory: 'Plumber', skillRequired: 'Tap Fixing',
      description: 'Kitchen tap leaking continuously',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      scheduledTime: '11:00 AM',
      address: { text: '12A, T. Nagar, Chennai - 600017', lat: 13.0418, lng: 80.2341 },
      estimatedPrice: { min: 250, max: 600 },
      status: 'pending',
      statusHistory: [{ status: 'pending' }],
    });
  }

  console.log('✅ Created sample bookings');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo Login Credentials:');
  console.log('  Admin:    admin@demo.com    / demo123');
  console.log('  User:     user@demo.com     / demo123');
  console.log('  Provider: provider@demo.com / demo123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seeder error:', err); process.exit(1); });
