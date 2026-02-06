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
    address: String
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