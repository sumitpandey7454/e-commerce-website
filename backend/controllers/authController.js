const User          = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// ── REGISTER ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'All fields are required' });
    if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered' });

    const user  = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json({ success:true, token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success:false, message:'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success:false, message:'Account is blocked' });

    const token = generateToken(user._id, user.role);
    res.json({ success:true, token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GOOGLE LOGIN ──────────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { token: idToken, role = 'buyer' } = req.body;
    const ticket  = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

    if (!user) {
      user = await User.create({
        name:     payload.name,
        email:    payload.email,
        googleId: payload.sub,
        avatar:   payload.picture,
        role,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.avatar   = payload.picture;
      await user.save();
    }

    const jwtToken = generateToken(user._id, user.role);
    res.json({ success:true, token: jwtToken, user: user.toSafeObject() });
  } catch (err) {
    res.status(401).json({ success:false, message:'Google authentication failed' });
  }
};

// ── SEND OTP ──────────────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ success:false, message:'Valid 10-digit phone required' });

    const otp     = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 min

    otpStore.set(phone, { otp, expires });

    // Send via Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: `Your ShopVerse OTP is ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   `+91${phone}`,
      });
    } else {
      console.log(`[DEV] OTP for ${phone}: ${otp}`); // Log for development
    }

    res.json({ success:true, message:'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ success:false, message:'Failed to send OTP' });
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'buyer' } = req.body;
    if (!phone || !otp) return res.status(400).json({ success:false, message:'Phone and OTP required' });

    const stored = otpStore.get(phone);
    if (!stored) return res.status(400).json({ success:false, message:'OTP not found. Please request again.' });
    if (Date.now() > stored.expires) { otpStore.delete(phone); return res.status(400).json({ success:false, message:'OTP expired' }); }
    if (stored.otp !== otp) return res.status(400).json({ success:false, message:'Invalid OTP' });

    otpStore.delete(phone);

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ name:`User${phone.slice(-4)}`, phone, role });
    }

    const token = generateToken(user._id, user.role);
    res.json({ success:true, token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success:true, user: user.toSafeObject() });
};