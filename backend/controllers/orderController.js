const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── CREATE ORDER ──────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'razorpay' } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success:false, message:'No items in order' });

    // Validate stock & build order items
    const orderItems = [];
    let totalAmount  = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).populate('seller','name');
      if (!product) return res.status(404).json({ success:false, message:`Product ${item.product} not found` });
      if (product.stock < item.qty) return res.status(400).json({ success:false, message:`Insufficient stock for ${product.name}` });

      orderItems.push({
        product: product._id,
        name:    product.name,
        price:   product.price,
        qty:     item.qty,
        image:   product.images?.[0] || '',
        seller:  product.seller._id,
      });
      totalAmount += product.price * item.qty;
    }

    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
    });

    res.status(201).json({ success:true, order });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET MY ORDERS (buyer) ─────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.product','name images price')
      .sort('-createdAt');
    res.json({ success:true, orders });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET SELLER ORDERS ─────────────────────────────────────────────────────────
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user.id })
      .populate('buyer','name email phone')
      .populate('items.product','name images')
      .sort('-createdAt');
    res.json({ success:true, orders });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET ALL ORDERS (admin) ────────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('buyer','name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success:true, orders, total });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET SINGLE ORDER ──────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer','name email phone')
      .populate('items.product','name images price');

    if (!order) return res.status(404).json({ success:false, message:'Order not found' });

    // Allow buyer who owns it, seller whose product is in it, or admin
    const isBuyer  = order.buyer._id.toString() === req.user.id;
    const isSeller = order.items.some(i => i.seller?.toString() === req.user.id);
    const isAdmin  = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success:false, message:'Not authorized' });
    }

    res.json({ success:true, order });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

// ── UPDATE ORDER STATUS ───────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message:'Order not found' });

    const isSeller = order.items.some(i => i.seller?.toString() === req.user.id);
    const isAdmin  = req.user.role === 'admin';
    if (!isSeller && !isAdmin) return res.status(403).json({ success:false, message:'Not authorized' });

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled' && cancelReason) order.cancelReason = cancelReason;

    await order.save();

    // Deduct stock on confirm
    if (status === 'confirmed') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty, numSales: item.qty } });
      }
    }

    res.json({ success:true, order });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};