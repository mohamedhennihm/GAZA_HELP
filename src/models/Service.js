const serviceSchema = new Schema({
  // Provider Info
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Service Details
  title: { type: String, required: true },
  titleAr: { type: String },
  description: { type: String, required: true },
  descriptionAr: { type: String },
  
  category: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },

  
  // Pricing Information
  pricing: {
    basePrice: { type: Number, required: true }, // Base price in service credits
    // priceType: { 
    //   type: String, 
    //   enum: ['per_hour', 'per_day', 'per_project', 'negotiable'],
    //   default: 'negotiable'
    // },
    minPrice: { type: Number }, // Minimum acceptable price
    maxPrice: { type: Number }, // Maximum price
  },

  
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
