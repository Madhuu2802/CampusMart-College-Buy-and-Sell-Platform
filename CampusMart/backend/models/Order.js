const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true, // ✅ ensures no duplicate orders
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },

    deliveryAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


// ✅ Auto-generate order number
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `CMS${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});


// ❌ REMOVED duplicate index line
// orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);