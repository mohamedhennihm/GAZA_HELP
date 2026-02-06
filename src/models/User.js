import mongoose from "mongoose";
const userSchema =  mongoose.Schema({
  // Basic Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  
  
  // Location (important for Gaza-specific areas)
  location: {
    governorate: { 
      type: String, 
      enum: ['North Gaza', 'Gaza', 'Deir al-Balah', 'Khan Yunis', 'Rafah'] 
    }
  },
  
  
  // Service Credits Wallet
  credits: {
    balance: { type: Number, default: 50 }, // Current credit balance (start with 50)
    earned: { type: Number, default: 0 }, // Total earned lifetime
    spent: { type: Number, default: 0 }, // Total spent lifetime
    escrow: { type: Number, default: 0 }, // Credits held in pending transactions
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
export default mongoose.model('User',userSchema);