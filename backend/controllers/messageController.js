const Message = require('../models/Message');

// ── SEND MESSAGE (public - no auth needed) ────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !message) return res.status(400).json({ success:false, message:'Name and message are required' });
    if (message.trim().length < 10) return res.status(400).json({ success:false, message:'Message too short (min 10 chars)' });

    const msg = await Message.create({
      name:    name.trim(),
      email:   email?.trim() || '',
      message: message.trim(),
      user:    req.user?.id || null,
    });

    res.status(201).json({ success:true, message:'Message sent successfully', data: msg });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET ALL MESSAGES (admin only) ─────────────────────────────────────────────
exports.getAllMessages = async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const query = {};
    if (read !== undefined) query.read = read === 'true';

    const total    = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .populate('user','name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success:true, messages, total, unread: await Message.countDocuments({ read:false }) });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── UPDATE MESSAGE (mark read / reply) ────────────────────────────────────────
exports.updateMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!msg) return res.status(404).json({ success:false, message:'Message not found' });
    res.json({ success:true, message: msg });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── DELETE MESSAGE (admin only) ───────────────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success:false, message:'Message not found' });
    res.json({ success:true, message:'Message deleted' });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};