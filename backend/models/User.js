const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:    { type: String, unique: true, sparse: true },
  password: { type: String, minlength: 8, select: false },
  role:     { type: String, enum: ['buyer','seller','admin'], default: 'buyer' },
  googleId: { type: String, unique: true, sparse: true },
  avatar:   { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  storeName:   { type: String, default: '' },
  storeDesc:   { type: String, default: '' },
  gstNumber:   { type: String, default: '' },

  addresses: [{
    label:    String,
    line1:    String,
    line2:    String,
    city:     String,
    state:    String,
    pincode:  String,
    isDefault:{ type: Boolean, default: false },
  }],

  otp:                { type: String, select: false },
  otpExpires:         { type: Date,   select: false },
  resetToken:         { type: String, select: false },
  resetTokenExpires:  { type: Date,   select: false },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

// Don't expose sensitive fields
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.resetToken;
  delete obj.resetTokenExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);