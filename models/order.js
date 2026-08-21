import mongoose, { model, models, Schema } from "mongoose";
const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true 
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true 
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
    index: true 
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
    zipCode: { type: String, required: true, trim: true },
  },
  shippingMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'assigned', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true 
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
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, paymentStatus: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ 'orderedItems.productId': 1 });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
orderSchema.index({ transactionId: 1 }, { sparse: true });
orderSchema.index({ 'shippingForm.email': 1 });
orderSchema.index({ total: -1, createdAt: -1 });
const Order = models?.Order || model('Order', orderSchema);
export default Order;