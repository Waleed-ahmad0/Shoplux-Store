import mongoose, { model, models, Schema } from "mongoose";

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true // Fast lookups by user
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true // Unique order lookups
  },

  orderedItems: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    selectedVariant: {
      type: Map,
      of: String,
      default: {}
    }
  }],

  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'card'],
    default: 'cod'
  },

  stripePaymentIntentId: {
    type: String,
    required: false,
  },

  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true // Filter orders by payment status
  },

  paymentDate: {
    type: Date,
    required: false
  },

  transactionId: {
    type: String,
    required: false,
  },

  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },

  shippingForm: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },

  shippingMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight'],
    default: 'express'
  },

  status: {
    type: String,
    required: true,
    enum: ['pending', 'assigned', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true // Filter orders by status
  },

  subtotal: {
    type: Number,
    required: true,
    min: 0
  },

  tax: {
    type: Number,
    required: true,
    min: 0
  },

  total: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// ===== INDEXES FOR OPTIMIZATION & SCALABILITY =====

// Compound index: User's orders sorted by date (most common dashboard query)
orderSchema.index({ userId: 1, createdAt: -1 });

// Compound index: User's orders filtered by status
orderSchema.index({ userId: 1, status: 1 });

// Compound index: User's orders filtered by payment status
orderSchema.index({ userId: 1, paymentStatus: 1 });

// Admin analytics: Orders by status and date
orderSchema.index({ status: 1, createdAt: -1 });

// Admin analytics: Orders by payment status and date
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

// For finding orders containing a specific product (returns/analytics)
orderSchema.index({ 'orderedItems.productId': 1 });

// For order lookup by transaction or payment intent
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
orderSchema.index({ transactionId: 1 }, { sparse: true });

// For shipping queries by email (customer support)
orderSchema.index({ 'shippingForm.email': 1 });

// Index for total amount (analytics: high value orders)
orderSchema.index({ total: -1, createdAt: -1 });

const Order = models?.Order || model('Order', orderSchema);

export default Order;