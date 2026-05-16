const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── GET ALL USERS (admin) ─────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role)   query.role = role;
    if (search) query.$or  = [
      { name:  { $regex: search, $options:'i' } },
      { email: { $regex: search, $options:'i' } },
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -otp -otpExpires -resetToken -resetTokenExpires')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success:true, users, total });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET SINGLE USER (admin) ───────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    // Extra info for admin
    const orderCount   = await Order.countDocuments({ buyer: user._id });
    const productCount = await Product.countDocuments({ seller: user._id });

    res.json({ success:true, user, orderCount, productCount });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── UPDATE USER (admin can update role/isActive; user can update own profile) ─
exports.updateUser = async (req, res) => {
  try {
    const isAdmin  = req.user.role === 'admin';
    const isSelf   = req.params.id === req.user.id;

    if (!isAdmin && !isSelf) return res.status(403).json({ success:false, message:'Not authorized' });

    // Non-admins cannot change their own role
    if (!isAdmin) delete req.body.role;
    // No one can directly set password here
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true })
      .select('-password');

    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch (err) {
    res.status(400).json({ success:false, message:err.message });
  }
};

// ── DELETE USER (admin only) ──────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success:false, message:'Cannot delete admin user' });

    await user.deleteOne();
    res.json({ success:true, message:'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── UPDATE MY PROFILE ─────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','phone','avatar','storeName','storeDesc','addresses'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new:true, runValidators:true })
      .select('-password');

    res.json({ success:true, user });
  } catch (err) {
    res.status(400).json({ success:false, message:err.message });
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success:false, message:'Both passwords required' });
    if (newPassword.length < 8) return res.status(400).json({ success:false, message:'New password must be at least 8 characters' });

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success:false, message:'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success:true, message:'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};