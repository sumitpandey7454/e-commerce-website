const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  category:      {
    type: String, required: true,
    enum: ['electronics','fashion','books','shoes','home-kitchen','sports','beauty','toys','automotive','grocery'],
  },
  brand:    { type: String, default: '' },
  images:   [{ type: String }],
  stock:    { type: Number, required: true, min: 0, default: 0 },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:     [{ type: String }],
  featured: { type: Boolean, default: false },
  status:   { type: String, enum: ['active','inactive'], default: 'active' },

  // Stats
  rating:     { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  numSales:   { type: Number, default: 0 },
  reviews:    [reviewSchema],
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

// Update avg rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  this.numReviews = this.reviews.length;
  this.rating = this.reviews.reduce((s, r) => s + r.rating, 0) / this.numReviews;
};

module.exports = mongoose.model('Product', productSchema);