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
  },
  
  // Profile
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationType: { 
    type: String, 
    enum: ['none', 'auto', 'admin'], 
    default: 'none'
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