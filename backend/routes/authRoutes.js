const express = require('express');
const router  = express.Router();
const {
  register, login, googleLogin,
  sendOtp, verifyOtp, getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register',    register);
router.post('/login',       login);
router.post('/google',      googleLogin);
router.post('/send-otp',    sendOtp);
router.post('/verify-otp',  verifyOtp);
router.get('/me',           protect, getMe);

module.exports = router;