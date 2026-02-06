const serviceSchema = new Schema({
  // Provider Info
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Service Details
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  proffession:{type:String, required:true},

  
  // Pricing Information will be changed
  pricing: {type:Number ,immutable:true },

  
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
