const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['books', 'electronics', 'furniture', 'clothing', 'sports', 'stationery', 'gadgets', 'other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'inactive'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  interestedBuyers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    contactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isNegotiable: {
    type: Boolean,
    default: true
  },
  originalPrice: {
    type: Number
  },
  purchaseDate: {
    type: Date
  },
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    validUntil: Date,
    details: String
  },
  deliveryOptions: {
    pickup: {
      type: Boolean,
      default: true
    },
    delivery: {
      type: Boolean,
      default: false
    },
    meetup: {
      type: Boolean,
      default: true
    }
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldAt: {
    type: Date
  },
  finalPrice: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for search functionality
marketplaceItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
marketplaceItemSchema.index({ seller: 1, status: 1 });
marketplaceItemSchema.index({ category: 1, status: 1 });
marketplaceItemSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);