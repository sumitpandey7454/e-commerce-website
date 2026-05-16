const express = require('express');
const router  = express.Router();
const {
  sendMessage, getAllMessages,
  updateMessage, deleteMessage,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public - anyone can send (optional auth to link user)
router.post('/', (req, res, next) => {
  // Try to attach user if token present, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const jwt  = require('jsonwebtoken');
    const User = require('../models/User');
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      User.findById(decoded.id).then(user => {
        req.user = user;
        next();
      }).catch(() => next());
    } catch { next(); }
  } else {
    next();
  }
}, sendMessage);

// Admin only
router.get('/admin/all',   protect, authorize('admin'), getAllMessages);
router.put('/:id',         protect, authorize('admin'), updateMessage);
router.delete('/:id',      protect, authorize('admin'), deleteMessage);

module.exports = router;