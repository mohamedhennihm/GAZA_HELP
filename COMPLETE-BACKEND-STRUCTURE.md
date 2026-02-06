# Gaza Rebuild Service Exchange Platform - Complete Backend Structure

## Project Tree Structure

```
gaza-rebuild-backend/
│
├── src/
│   ├── config/
│   │   ├── database.js           # Database connection configuration
│   │   ├── env.js                # Environment variables
│   │   └── constants.js          # App constants (service categories, etc.)
│   │
│   ├── models/
│   │   ├── User.js               # User model with credits system
│   │   ├── Service.js            # Service offering model with pricing
│   │   ├── ServiceCategory.js    # Categories (builder, doctor, etc.)
│   │   ├── Transaction.js        # Service purchase transactions
│   │   ├── CreditTransaction.js  # Credit movement tracking
│   │   ├── Review.js             # User reviews and ratings
│   │   ├── Notification.js       # User notifications
│   │   ├── Report.js             # Content moderation reports
│   │   └── SavedService.js       # Bookmarked services
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication & registration
│   │   ├── userController.js     # User profile management
│   │   ├── serviceController.js  # Service CRUD operations
│   │   ├── transactionController.js  # Handle service purchases
│   │   ├── creditController.js   # Credit management
│   │   ├── reviewController.js   # Reviews and ratings
│   │   ├── notificationController.js # Notifications
│   │   └── searchController.js   # Search and filter services
│   │
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── users.js              # User routes
│   │   ├── services.js           # Service routes
│   │   ├── transactions.js       # Transaction routes
│   │   ├── credits.js            # Credit routes
│   │   ├── reviews.js            # Review routes
│   │   ├── notifications.js      # Notification routes
│   │   └── index.js              # Main router
│   │
│   ├── middleware/
│   │   ├── auth.js               # Authentication middleware
│   │   ├── validation.js         # Request validation
│   │   ├── errorHandler.js       # Error handling
│   │   ├── uploadHandler.js      # File upload handling
│   │   └── rateLimiter.js        # Rate limiting
│   │
│   ├── utils/
│   │   ├── validators.js         # Input validation helpers
│   │   ├── emailService.js       # Email notifications
│   │   ├── imageUpload.js        # Image handling
│   │   ├── verificationHelper.js # Auto-verification logic
│   │   └── helpers.js            # General helper functions
│   │
│   ├── services/
│   │   ├── creditService.js      # Credit transaction logic
│   │   ├── notificationService.js # Notification handling
│   │   └── analyticsService.js   # Platform analytics
│   │
│   └── app.js                    # Express app setup
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .gitignore
├── package.json
└── server.js                     # Entry point
```

---

## Database Models (Mongoose Schemas)

### 1. User Model

```javascript
const userSchema = new Schema({
  // Basic Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  
  // Contact Information (shared when transaction is accepted)
  contactInfo: {
    whatsapp: { type: String }, // WhatsApp number
    telegram: { type: String }, // Telegram username
    preferredContact: { 
      type: String, 
      enum: ['phone', 'whatsapp', 'telegram', 'email'],
      default: 'phone'
    }
  },
  
  // Location (important for Gaza-specific areas)
  location: {
    governorate: { 
      type: String, 
      enum: ['North Gaza', 'Gaza', 'Deir al-Balah', 'Khan Yunis', 'Rafah'] 
    },
    area: { type: String },
    address: { type: String },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Profile
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationType: { 
    type: String, 
    enum: ['none', 'document', 'auto', 'admin'], 
    default: 'none'
    // 'document' - verified through ID/documents
    // 'auto' - auto-verified after 50 completed services
    // 'admin' - manually verified by admin
  },
  verificationDocuments: [{ type: String }],
  verifiedAt: { type: Date },
  
  // Service Credits Wallet
  credits: {
    balance: { type: Number, default: 50 }, // Current credit balance (start with 50)
    earned: { type: Number, default: 0 }, // Total earned lifetime
    spent: { type: Number, default: 0 }, // Total spent lifetime
    escrow: { type: Number, default: 0 }, // Credits held in pending transactions
  },
  
  // Service Statistics (for auto-verification)
  serviceStats: {
    completedAsProvider: { type: Number, default: 0 }, // Services provided
    completedAsRequester: { type: Number, default: 0 }, // Services received
    totalCompleted: { type: Number, default: 0 }, // Total completed transactions
    acceptanceRate: { type: Number, default: 0 }, // % of accepted requests
    completionRate: { type: Number, default: 0 } // % of completed vs accepted
  },
  
  // Rating
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  // Activity
  servicesOffered: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  
  // Status
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'location.governorate': 1 });
userSchema.index({ isVerified: 1 });
```

---

### 2. ServiceCategory Model

```javascript
const serviceCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true }, // Arabic name
  description: { type: String },
  descriptionAr: { type: String },
  icon: { type: String },
  
  // Examples: Construction, Medical, Education, Electrical, 
  // Plumbing, Legal, Technology, Transportation, etc.
  
  parentCategory: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
  subCategories: [{ type: Schema.Types.ObjectId, ref: 'ServiceCategory' }],
  
  isActive: { type: Boolean, default: true },
  
  timestamps: true
});
```

---

### 3. Service Model

```javascript
const serviceSchema = new Schema({
  // Provider Info
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Service Details
  title: { type: String, required: true },
  titleAr: { type: String },
  description: { type: String, required: true },
  descriptionAr: { type: String },
  
  category: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  subCategory: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
  
  // Pricing Information
  pricing: {
    basePrice: { type: Number, required: true }, // Base price in service credits
    priceType: { 
      type: String, 
      enum: ['per_hour', 'per_day', 'per_project', 'negotiable'],
      default: 'negotiable'
    },
    minPrice: { type: Number }, // Minimum acceptable price
    maxPrice: { type: Number }, // Maximum price
  },
  
  // Skills/Certifications
  skills: [{ type: String }],
  certifications: [{ type: String }], // URLs to certificate images
  
  // Availability
  availability: {
    status: { 
      type: String, 
      enum: ['available', 'busy', 'unavailable'], 
      default: 'available' 
    },
    schedule: {
      monday: { available: Boolean, hours: String },
      tuesday: { available: Boolean, hours: String },
      wednesday: { available: Boolean, hours: String },
      thursday: { available: Boolean, hours: String },
      friday: { available: Boolean, hours: String },
      saturday: { available: Boolean, hours: String },
      sunday: { available: Boolean, hours: String }
    }
  },
  
  // Service Specifics
  estimatedDuration: { type: String }, // "2 hours", "1 day", etc.
  serviceArea: [{ type: String }], // Areas they can serve
  
  // Media
  images: [{ type: String }],
  portfolio: [{ 
    title: String,
    description: String,
    image: String,
    date: Date
  }],
  
  // Metrics
  views: { type: Number, default: 0 },
  requests: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  
  timestamps: true
});

// Indexes
serviceSchema.index({ category: 1 });
serviceSchema.index({ provider: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
```

---

### 4. Transaction Model

```javascript
const transactionSchema = new Schema({
  // Parties
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Service provider
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Service buyer
  
  // Service Being Purchased
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  
  // Pricing & Payment
  pricing: {
    credits: { type: Number, required: true }, // Cost in service credits
    estimatedHours: { type: Number }, // Optional: helps calculate fair price
    agreedPrice: { type: Number }, // Final negotiated price
  },
  
  // Transaction Details
  description: { type: String, required: true }, // What exactly needs to be done
  customerNotes: { type: String }, // Special requirements from customer
  
  // Status Flow: pending → accepted → in-progress → completed → paid
  status: { 
    type: String, 
    enum: [
      'pending',        // Customer sent request
      'accepted',       // Provider accepted the job
      'rejected',       // Provider rejected
      'in-progress',    // Work started
      'completed',      // Work finished (waiting for payment confirmation)
      'paid',           // Credits transferred
      'cancelled',      // Either party cancelled
      'disputed'        // Payment/quality dispute
    ],
    default: 'pending'
  },
  
  // Timeline
  requestedDate: { type: Date, default: Date.now },
  acceptedDate: { type: Date },
  startedDate: { type: Date },
  completedDate: { type: Date },
  paidDate: { type: Date },
  
  // Scheduling
  scheduledDate: { type: Date },
  estimatedDuration: { type: String }, // "3 hours", "2 days"
  
  // Location where service will be performed
  serviceLocation: {
    address: String,
    governorate: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact Information Access
  contactShared: {
    sharedAt: { type: Date }, // When contact info was shared (on acceptance)
    providerContactShared: { type: Boolean, default: false },
    customerContactShared: { type: Boolean, default: false }
  },
  
  // Payment Tracking
  payment: {
    amount: { type: Number }, // Final amount paid
    paidAt: { type: Date },
    escrowReleased: { type: Boolean, default: false }, // Credits held until work confirmed
  },
  
  // Cancellation
  cancellation: {
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    refundIssued: { type: Boolean, default: false },
    timestamp: Date
  },
  
  // Dispute Resolution
  dispute: {
    isDisputed: { type: Boolean, default: false },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    resolution: String,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin
    timestamp: Date
  },
  
  timestamps: true
});

// Indexes
transactionSchema.index({ provider: 1, status: 1 });
transactionSchema.index({ customer: 1, status: 1 });
transactionSchema.index({ status: 1 });
```

---

### 5. CreditTransaction Model

```javascript
const creditTransactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: [
      'earned',         // Earned from providing service
      'spent',          // Spent on purchasing service
      'bonus',          // Platform bonus/reward
      'refund',         // Refund from cancelled transaction
      'penalty',        // Deduction for violation
      'initial_bonus',  // Sign-up bonus
      'admin_adjustment' // Admin manual adjustment
    ],
    required: true 
  },
  
  amount: { type: Number, required: true }, // Positive for credit, negative for debit
  
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  
  // Reference to what caused this credit change
  relatedTransaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  relatedService: { type: Schema.Types.ObjectId, ref: 'Service' },
  
  description: { type: String },
  
  // Admin actions
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // If admin action
  
  timestamps: true
});

// Indexes
creditTransactionSchema.index({ user: 1, createdAt: -1 });
```

---

### 6. Review Model

```javascript
const reviewSchema = new Schema({
  // Review Details
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Ratings (1-5 scale)
  rating: { type: Number, required: true, min: 1, max: 5 },
  
  // Detailed Ratings
  ratings: {
    quality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 }
  },
  
  // Review Content
  comment: { type: String, maxlength: 1000 },
  
  // Media
  images: [{ type: String }],
  
  // Helpful Votes
  helpfulVotes: { type: Number, default: 0 },
  votedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Verification
  isVerified: { type: Boolean, default: true }, // Verified transaction
  
  // Response from reviewed user
  response: {
    content: String,
    timestamp: Date
  },
  
  timestamps: true
});

// Indexes
reviewSchema.index({ reviewedUser: 1 });
reviewSchema.index({ transaction: 1 });
```

---

### 7. Notification Model

```javascript
const notificationSchema = new Schema({
  // Recipient
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Notification Details
  type: { 
    type: String, 
    enum: [
      'new_request',          // New service request received
      'request_accepted',     // Your request was accepted
      'request_rejected',     // Your request was rejected
      'service_started',      // Service work has started
      'service_completed',    // Service work completed
      'payment_received',     // Credits received
      'payment_sent',         // Credits sent
      'new_review',          // New review received
      'service_reminder',    // Reminder about upcoming service
      'verification_earned', // Earned verification badge
      'milestone_reached',   // Reached service milestone
      'low_credits',         // Credit balance low
      'system_announcement'  // Platform announcements
    ],
    required: true 
  },
  
  // Content
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Related Items
  relatedTransaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  relatedService: { type: Schema.Types.ObjectId, ref: 'Service' },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Action
  actionUrl: { type: String },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
```

---

### 8. Report Model (for content moderation)

```javascript
const reportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reportedService: { type: Schema.Types.ObjectId, ref: 'Service' },
  reportedReview: { type: Schema.Types.ObjectId, ref: 'Review' },
  
  reason: { 
    type: String, 
    enum: ['spam', 'inappropriate', 'fraud', 'harassment', 'fake_service', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  
  adminNotes: { type: String },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ reporter: 1 });
```

---

### 9. SavedService Model (wishlist/bookmarks)

```javascript
const savedServiceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  notes: { type: String },
  
  timestamps: true
});

// Indexes
savedServiceSchema.index({ user: 1 });
savedServiceSchema.index({ user: 1, service: 1 }, { unique: true });
```

---

## API Endpoints Structure

### Authentication
- POST `/api/auth/register` - User registration (gets 50 initial credits)
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/reset-password/:token` - Reset password
- GET `/api/auth/verify-email/:token` - Email verification

### Users
- GET `/api/users/profile` - Get current user profile
- PUT `/api/users/profile` - Update profile
- PUT `/api/users/contact-info` - Update contact information
- GET `/api/users/:id` - Get user by ID (public profile)
- GET `/api/users/:id/services` - Get user's services
- GET `/api/users/:id/reviews` - Get user reviews
- GET `/api/users/:id/statistics` - Get user service statistics
- GET `/api/users/verified` - List all verified users
- POST `/api/users/avatar` - Upload avatar

### Services
- POST `/api/services` - Create service
- GET `/api/services` - List all services (with filters)
- GET `/api/services/:id` - Get service details
- PUT `/api/services/:id` - Update service
- DELETE `/api/services/:id` - Delete service
- GET `/api/services/search` - Search services
- POST `/api/services/:id/save` - Bookmark service
- DELETE `/api/services/:id/save` - Remove bookmark
- GET `/api/services/saved` - Get user's saved services

### Transactions
- POST `/api/transactions` - Create transaction request (puts credits in escrow)
- GET `/api/transactions` - Get user's transactions
- GET `/api/transactions/:id` - Get transaction details
- PUT `/api/transactions/:id/accept` - Accept request (shares contact info)
- PUT `/api/transactions/:id/reject` - Reject request
- PUT `/api/transactions/:id/start` - Mark as started
- PUT `/api/transactions/:id/complete` - Mark as completed (provider)
- PUT `/api/transactions/:id/confirm-payment` - Confirm and release payment (customer)
- PUT `/api/transactions/:id/cancel` - Cancel transaction
- PUT `/api/transactions/:id/dispute` - Raise dispute
- GET `/api/transactions/:id/contact` - Get contact info (only after acceptance)

### Credits
- GET `/api/credits/balance` - Get current credit balance
- GET `/api/credits/history` - Get credit transaction history
- GET `/api/credits/statistics` - Get earning/spending statistics

### Reviews
- POST `/api/reviews` - Create review (only after paid transaction)
- GET `/api/reviews/user/:userId` - Get user reviews
- GET `/api/reviews/:id` - Get review details
- PUT `/api/reviews/:id/response` - Respond to review
- POST `/api/reviews/:id/helpful` - Mark review as helpful

### Notifications
- GET `/api/notifications` - Get user notifications
- GET `/api/notifications/unread` - Get unread notifications
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get category details
- GET `/api/categories/:id/services` - Get services by category

### Reports
- POST `/api/reports` - Create report
- GET `/api/reports` - Get user's reports (admin only)
- PUT `/api/reports/:id` - Update report status (admin only)

### Search
- GET `/api/search/services` - Advanced service search
- GET `/api/search/users` - Search for service providers

---

## Environment Variables (.env.example)

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/gaza-rebuild

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
FROM_EMAIL=noreply@gazarebuild.org
FROM_NAME=Gaza Rebuild Platform

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Cloudinary (for image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Credits System
INITIAL_USER_CREDITS=50
MAX_CREDITS_ESCROW=1000

# Auto-Verification
AUTO_VERIFY_THRESHOLD=50

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Package.json Dependencies

```json
{
  "name": "gaza-rebuild-backend",
  "version": "1.0.0",
  "description": "Backend for Gaza Rebuild Service Exchange Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --watchAll"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "express-validator": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.37.0",
    "nodemailer": "^6.9.1",
    "express-rate-limit": "^6.7.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

---

## Key Features Summary

### 1. Credit-Based Economy
- Users start with 50 credits
- Earn credits by providing services
- Spend credits to purchase services
- Escrow system for secure transactions
- Complete transaction history tracking

### 2. Auto-Verification System
- Automatic verification after 50 completed services
- Badge displayed on profile and service listings
- Three verification types: document, auto, admin

### 3. Contact Sharing (No In-App Messaging)
- Contact info shared only after transaction acceptance
- Supports phone, WhatsApp, and Telegram
- Users communicate externally
- Simpler and more practical for Gaza

### 4. Trust & Safety
- User reviews and ratings
- Service portfolios with proof of work
- Report system for inappropriate content
- Dispute resolution system

### 5. Location-Based
- Gaza governorate system
- Service area specification
- Coordinate-based search

### 6. Bilingual Support
- Arabic and English throughout
- All user-facing content supports both languages

---

## Notes

1. **Credit System**: Virtual currency for service exchange
2. **No Messaging**: Users communicate via phone/WhatsApp/Telegram after acceptance
3. **Auto-Verification**: Earned after 50 completed paid services
4. **Escrow Protection**: Credits locked until service confirmed
5. **Gaza-Specific**: Location system tailored for Gaza governorates
6. **Trust Building**: Reviews, portfolios, and verification badges
7. **Simple & Practical**: Focus on core functionality that works in Gaza's context

---

## Transaction Flow Example

1. **Customer**: "I need a builder" (has 100 credits)
2. **Browse**: Finds Ahmad (verified builder, 30 credits/day)
3. **Request**: Sends transaction request (30 credits moved to escrow)
4. **Accept**: Ahmad accepts → Both get each other's contact info
5. **Communicate**: They talk via WhatsApp to discuss details
6. **Work**: Ahmad completes the work, uploads photos
7. **Confirm**: Customer confirms completion
8. **Payment**: 30 credits released to Ahmad
9. **Review**: Customer leaves 5-star review
10. **Verification**: Ahmad's counter: 48/50 → almost verified!

---

Good luck building this important platform! 🇵🇸
