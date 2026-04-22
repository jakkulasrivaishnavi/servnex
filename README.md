# ⚡ SkillBridge — Local Services Platform

A full-stack MERN application connecting users with verified local service providers (electricians, plumbers, carpenters, etc.) with real-time chat, live tracking, Razorpay payments, and an admin dashboard.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Socket.io Client |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Payments | Razorpay |
| Auth | JWT + bcryptjs |
| Maps | Google Maps JS API |

---

## 📁 Project Structure

```
skillbridge/
├── backend/
│   ├── controllers/     # Business logic
│   │   ├── authController.js
│   │   ├── providerController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Provider.js
│   │   ├── Booking.js
│   │   ├── Message.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/          # Express route handlers
│   ├── middleware/      # JWT auth middleware
│   ├── socket/          # Socket.io handler
│   ├── seeder.js        # Database seed script
│   ├── server.js        # Entry point
│   └── .env.example     # Environment template
│
└── frontend/
    └── src/
        ├── context/     # React Context (Auth, Socket)
        ├── pages/       # All page components
        ├── components/  # Reusable components
        └── utils/       # API utility (axios)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay test account
- Google Maps API key (optional for maps)

### 1. Backend Setup

```bash
cd skillbridge/backend
npm install

# Copy env file
cp .env.example .env
# Edit .env with your values

# Seed demo data
node seeder.js

# Start backend (dev)
npm run dev
# Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd skillbridge/frontend
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env

# Start frontend
npm start
# Opens http://localhost:3000
```

---

## 🔑 Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skillbridge

JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRE=30d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

GOOGLE_MAPS_API_KEY=your_google_maps_key
CLIENT_URL=http://localhost:3000
```

---

## 👤 Demo Accounts (after seeding)

| Role     | Email                | Password |
|----------|----------------------|----------|
| Admin    | admin@demo.com       | demo123  |
| User     | user@demo.com        | demo123  |
| Provider | provider@demo.com    | demo123  |

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user/provider |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update-profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Providers
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/providers/search | Search providers (with filters) |
| GET | /api/providers/top | AI-based recommendations |
| GET | /api/providers/categories | Get all service categories |
| GET | /api/providers/:id | Get provider details |
| POST | /api/providers/profile | Create provider profile |
| PUT | /api/providers/profile | Update provider profile |
| PUT | /api/providers/availability | Toggle availability |
| PUT | /api/providers/live-location | Update GPS location |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/bookings | Create booking request |
| GET | /api/bookings/user | Get user's bookings |
| GET | /api/bookings/provider | Get provider's bookings |
| GET | /api/bookings/:id | Get booking detail |
| PUT | /api/bookings/:id/status | Update booking status |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/chat/send | Send message |
| GET | /api/chat/conversations | All conversations |
| GET | /api/chat/:userId | Get conversation |
| GET | /api/chat/unread | Unread message count |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment signature |

### Reviews
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/reviews | Create review |
| GET | /api/reviews/provider/:id | Get provider reviews |
| PUT | /api/reviews/:id/reply | Provider reply to review |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/providers/pending | Pending approvals |
| PUT | /api/admin/providers/:id/verify | Approve/reject provider |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/toggle | Enable/disable user |
| GET | /api/admin/bookings | All bookings |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| user:online | Client → Server | Register online user |
| user:status | Server → Client | User online/offline |
| chat:join | Client → Server | Join a chat room |
| chat:message | Bidirectional | Send/receive message |
| chat:typing | Bidirectional | Typing indicator |
| chat:read | Bidirectional | Mark messages read |
| provider:location | Client → Server | Update GPS (provider) |
| provider:location | Server → Client | Live tracking broadcast |
| booking:track | Client → Server | Join booking tracking room |
| booking:statusUpdate | Server → Client | Booking status notification |

---

## 📊 Database Schema

### Users
```
id, name, email, phone, password, role, avatar, location{address,lat,lng}, isActive
```

### Providers
```
id, user(ref), serviceCategory, skills[], experience, priceRange{min,max},
location{address,lat,lng}, liveLocation{lat,lng,updatedAt},
availability{isAvailable, workingHours, workingDays},
rating{average,count}, completedJobs, totalEarnings, bio,
verificationStatus, badges[]
```

### Bookings
```
id, user(ref), provider(ref), serviceCategory, skillRequired, description,
scheduledDate, scheduledTime, address, estimatedPrice, finalPrice,
status, statusHistory[], paymentStatus, payment(ref), hasReview
```

### Messages
```
id, chatRoom, sender(ref), receiver(ref), message, messageType, isRead, timestamp
```

### Payments
```
id, booking(ref), user(ref), provider(ref), amount, razorpayOrderId,
razorpayPaymentId, razorpaySignature, status, paymentMethod
```

### Reviews
```
id, booking(ref), user(ref), provider(ref), rating, comment, tags[], providerReply
```

---

## 🤖 Recommendation Algorithm

The `/api/providers/top` endpoint uses a weighted scoring system:

```
score = (rating × 0.5) + (completedJobs/50 × 0.3) + (1/distance × 0.2)
```

This ranks providers by a combination of quality, experience, and proximity.

---

## 💳 Razorpay Integration

1. Get free test keys from [razorpay.com](https://razorpay.com)
2. Use test card: `4111 1111 1111 1111`, CVV: any 3 digits, Expiry: any future date
3. UPI test ID: `success@razorpay`

---

## 🗺️ Google Maps Integration

Add your Maps API key to `.env` and replace the static address display in `SearchPage.jsx` and `ProviderDetailPage.jsx` with the `@googlemaps/js-api-loader` package for live map views.

---

## 🔒 Security Features

- JWT authentication with 30-day expiry
- Password hashing with bcrypt (12 rounds)  
- Role-based access control (user / provider / admin)
- Input validation on all endpoints
- Razorpay signature verification for payments
- CORS restricted to frontend origin

---

## 📱 Features Summary

| Feature | Status |
|---------|--------|
| User Registration/Login | ✅ |
| Provider Onboarding (multi-step) | ✅ |
| Admin Verification Workflow | ✅ |
| Search with Filters + Distance | ✅ |
| Booking System | ✅ |
| Real-time Chat (Socket.io) | ✅ |
| Typing Indicators | ✅ |
| Razorpay Payment Integration | ✅ |
| Rating & Reviews | ✅ |
| Provider Reply to Reviews | ✅ |
| AI-based Recommendations | ✅ |
| Live Location Tracking | ✅ |
| Admin Dashboard | ✅ |
| Provider Availability Toggle | ✅ |
| Status Timeline | ✅ |
| Notification System | ✅ |
