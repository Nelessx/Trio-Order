import mongoose from 'mongoose';

const specialOfferSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  originalPrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  discountedPrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  discountPercentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  validFrom: { 
    type: Date, 
    default: Date.now 
  },
  validUntil: { 
    type: Date,
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  // Additional fields for better management
  priority: { 
    type: Number, 
    default: 0,
    min: 0 
  }, // Higher number = higher priority
  tags: [{ 
    type: String,
    trim: true 
  }], // e.g., ["limited-time", "popular", "new"]
}, { 
  timestamps: true 
});

// Index for better query performance
specialOfferSchema.index({ isActive: 1, validUntil: 1 });
specialOfferSchema.index({ item: 1 });

// Virtual for calculating savings amount
specialOfferSchema.virtual('savingsAmount').get(function() {
  return this.originalPrice - this.discountedPrice;
});

// Ensure virtual fields are serialized
specialOfferSchema.set('toJSON', { virtuals: true });

export default mongoose.models.SpecialOffer || mongoose.model('SpecialOffer', specialOfferSchema);

