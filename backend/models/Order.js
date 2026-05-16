const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
  image:    { type: String, default: '' },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name:    String,
    phone:   String,
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String,
  },
  totalAmount:   { type: Number, required: true },
  shippingCost:  { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending','confirmed','shipped','delivered','cancelled','refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending','success','failed','refunded'],
    default: 'pending',
  },
  paymentMethod: { type: String, default: 'razorpay' },

  // Razorpay IDs
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  deliveredAt:  { type: Date },
  cancelReason: { type: String },
}, { timestamps: true });

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1 });

module.exports = mongoose.model('Order', orderSchema);