# Gaza Rebuild Backend - Implementation Sequence Guide

## Step-by-Step Development Roadmap

---

## PHASE 1: PROJECT SETUP (Day 1)

### Step 1: Initialize Project
```bash
# Create project directory
mkdir gaza-rebuild-backend
cd gaza-rebuild-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors express-validator multer cloudinary nodemailer express-rate-limit helmet morgan socket.io

# Install dev dependencies
npm install --save-dev nodemon jest supertest
```

### Step 2: Create Folder Structure
```bash
# Create all directories
mkdir -p src/{config,models,controllers,routes,middleware,utils,services}
mkdir -p tests/{unit,integration}
mkdir uploads
```

### Step 3: Setup Configuration Files

**Create `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gaza-rebuild
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

**Create `.gitignore` file:**
```
node_modules/
.env
uploads/
*.log
.DS_Store
```

**Create `package.json` scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

---

## PHASE 2: CORE SETUP (Day 1-2)

### Step 4: Database Connection

**Create `src/config/database.js`:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 5: Create Entry Point

**Create `server.js`:**
```javascript
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Gaza Rebuild API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Test it:**
```bash
npm run dev
# Visit http://localhost:5000
```

---

## PHASE 3: BUILD MODELS (Day 2-3)

### Step 6: Create Models in This Order

**Priority 1: User Model** (`src/models/User.js`)
- This is the foundation - create this FIRST
- Include all fields: authentication, profile, location, verification, stats

**Priority 2: ServiceCategory Model** (`src/models/ServiceCategory.js`)
- Needed before creating services
- Seed initial categories (builder, doctor, electrician, etc.)

**Priority 3: Service Model** (`src/models/Service.js`)
- References User and ServiceCategory

**Priority 4: Transaction Model** (`src/models/Transaction.js`)
- Core business logic - service exchanges

**Priority 5: Review Model** (`src/models/Review.js`)
- Trust and rating system

**Priority 6: Message Model** (`src/models/Message.js`)
- User communication

**Priority 7: Notification Model** (`src/models/Notification.js`)
- User alerts

**Optional Models (can add later):**
- Report Model
- SavedService Model

---

## PHASE 4: AUTHENTICATION SYSTEM (Day 3-4)

### Step 7: Create Authentication Middleware

**Create `src/middleware/auth.js`:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};
```

### Step 8: Create Auth Controller

**Create `src/controllers/authController.js`:**
```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 9: Create Auth Routes

**Create `src/routes/auth.js`:**
```javascript
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

### Step 10: Wire Up Routes in Server

**Update `server.js`:**
```javascript
// ... existing code ...

// Routes
app.use('/api/auth', require('./src/routes/auth'));

// ... rest of code ...
```

**Test Authentication:**
```bash
# Test registration
POST http://localhost:5000/api/auth/register
Body: {
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "password": "password123"
}

# Test login
POST http://localhost:5000/api/auth/login
Body: {
  "email": "ahmed@example.com",
  "password": "password123"
}
```

---

## PHASE 5: BUILD CORE FEATURES (Day 5-10)

### Step 11: Service Category Setup

**Order of Implementation:**

1. **Categories Routes & Controller** (`src/routes/categories.js`, `src/controllers/categoryController.js`)
   - GET all categories
   - GET category by ID
   - POST create category (admin only)

2. **Seed Categories Script** (`src/config/seedCategories.js`)
   ```javascript
   const categories = [
     { name: 'Construction', nameAr: 'البناء' },
     { name: 'Medical', nameAr: 'الطبي' },
     { name: 'Education', nameAr: 'التعليم' },
     { name: 'Electrical', nameAr: 'الكهرباء' },
     { name: 'Plumbing', nameAr: 'السباكة' },
     { name: 'Transportation', nameAr: 'النقل' },
     // ... add more
   ];
   ```

### Step 12: User Management

**Create in this order:**
1. User Controller (`src/controllers/userController.js`)
   - Get profile
   - Update profile
   - Upload avatar
   - Get user statistics

2. User Routes (`src/routes/users.js`)

### Step 13: Service Management

**Create:**
1. Service Controller (`src/controllers/serviceController.js`)
   - Create service
   - Get all services (with filters)
   - Get service by ID
   - Update service
   - Delete service
   - Search services

2. Service Routes (`src/routes/services.js`)

### Step 14: Transaction System (CRITICAL)

**Create:**
1. Transaction Controller (`src/controllers/transactionController.js`)
   - Create transaction request
   - Accept/reject request
   - Mark as completed (includes auto-verification logic)
   - Cancel transaction
   - Get user transactions

2. Transaction Routes (`src/routes/transactions.js`)

### Step 15: Review System

**Create:**
1. Review Controller
2. Review Routes

### Step 16: Messaging System

**Create:**
1. Message Controller
2. Message Routes
3. Socket.io integration for real-time chat

### Step 17: Notification System

**Create:**
1. Notification Controller
2. Notification Routes
3. Notification service (`src/services/notificationService.js`)

---

## PHASE 6: ADVANCED FEATURES (Day 11-14)

### Step 18: File Upload

**Create `src/middleware/uploadHandler.js`:**
- Setup Multer for local uploads
- Setup Cloudinary for cloud storage
- Image validation and resizing

### Step 19: Search & Filter

**Create `src/controllers/searchController.js`:**
- Advanced search with filters
- Location-based search
- Category filtering

### Step 20: Auto-Verification Logic

**Create `src/utils/verificationHelper.js`:**
```javascript
const checkAndUpdateVerification = async (userId) => {
  const user = await User.findById(userId);
  
  if (user.serviceStats.completedAsProvider >= 50 && !user.isVerified) {
    user.isVerified = true;
    user.verificationType = 'auto';
    user.verifiedAt = new Date();
    await user.save();
    
    // Send notification
    await Notification.create({
      user: userId,
      type: 'verification_earned',
      title: 'Congratulations!',
      message: 'You earned your verified badge!',
    });
  }
};
```

**Integrate into Transaction Controller's complete function**

---

## PHASE 7: SECURITY & OPTIMIZATION (Day 15-16)

### Step 21: Add Security Layers

1. **Rate Limiting** (`src/middleware/rateLimiter.js`)
2. **Input Validation** (`src/middleware/validation.js`)
3. **Error Handling** (`src/middleware/errorHandler.js`)
4. **Helmet.js** (already added)

### Step 22: Add Indexes to Models

```javascript
// In User model
userSchema.index({ email: 1 });
userSchema.index({ 'location.governorate': 1 });

// In Service model
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'provider': 1 });
serviceSchema.index({ isActive: 1 });
```

---

## PHASE 8: TESTING (Day 17-18)

### Step 23: Write Tests

1. **Unit Tests** for utility functions
2. **Integration Tests** for API endpoints
3. **Test Authentication flow**
4. **Test Transaction flow**
5. **Test Auto-verification**

---

## PHASE 9: DEPLOYMENT PREP (Day 19-20)

### Step 24: Production Setup

1. **Environment Variables** - secure all secrets
2. **Database** - setup MongoDB Atlas
3. **File Storage** - configure Cloudinary
4. **CORS** - configure allowed origins
5. **Logging** - setup proper logging
6. **Documentation** - API documentation (Postman/Swagger)

---

## QUICK START CHECKLIST

### Absolute Minimum to Get Started (2-3 days):

- [ ] ✅ Project setup & dependencies
- [ ] ✅ Database connection
- [ ] ✅ User model
- [ ] ✅ ServiceCategory model
- [ ] ✅ Service model
- [ ] ✅ Transaction model
- [ ] ✅ Auth (register/login)
- [ ] ✅ User routes (profile)
- [ ] ✅ Service routes (CRUD)
- [ ] ✅ Transaction routes (create, complete)
- [ ] ✅ Auto-verification in transaction completion

### For MVP (1 week):
Add to the above:
- [ ] ✅ Review system
- [ ] ✅ Search & filter
- [ ] ✅ Image upload
- [ ] ✅ Basic notifications

### For Full Version (2-3 weeks):
Add everything else:
- [ ] ✅ Real-time messaging
- [ ] ✅ Advanced search
- [ ] ✅ Admin panel
- [ ] ✅ Email notifications
- [ ] ✅ Analytics
- [ ] ✅ Complete testing

---

## DEVELOPMENT TIPS

### Database First Approach
1. Start MongoDB locally or use MongoDB Atlas
2. Test connection before building models
3. Use MongoDB Compass to visualize data

### Iterative Testing
- Test each route with Postman/Thunder Client as you build
- Don't wait until the end to test
- Create a Postman collection to save requests

### Common Pitfalls to Avoid
1. ❌ Don't forget to hash passwords before saving
2. ❌ Don't expose password in API responses
3. ❌ Don't skip input validation
4. ❌ Don't hardcode secrets in code
5. ❌ Don't forget to handle errors properly

### Recommended Tools
- **API Testing**: Postman or Thunder Client (VS Code extension)
- **Database GUI**: MongoDB Compass
- **Code Editor**: VS Code with extensions (ESLint, Prettier)
- **Version Control**: Git & GitHub

---

## Next Steps After Backend is Built

1. **Frontend Development** - React/Next.js app
2. **Mobile App** - React Native (optional)
3. **Admin Dashboard** - Manage users, services, reports
4. **Analytics** - Track platform usage and impact
5. **Marketing** - Get real users from Gaza

---

## FINAL NOTE

**Start small, iterate fast!**

Build the core loop first:
1. User signs up → 
2. Creates a service → 
3. Someone requests it → 
4. Transaction completes → 
5. Review left → 
6. Auto-verification after 50 services

Once this works, add features one by one.

Good luck rebuilding Gaza! 🇵🇸
