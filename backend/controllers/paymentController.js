const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const Product  = require('../models/Product');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── CREATE RAZORPAY ORDER ─────────────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, productId, quantity = 1, items, shippingAddress } = req.body;

    // Support single product or cart
    let totalAmount = 0;
    let orderItems  = [];

    if (productId) {
      const product = await Product.findById(productId);
      if (!product)       return res.status(404).json({ success:false, message:'Product not found' });
      if (product.stock < quantity) return res.status(400).json({ success:false, message:'Insufficient stock' });

      totalAmount = product.price * quantity;
      orderItems  = [{
        product: product._id,
        name:    product.name,
        price:   product.price,
        qty:     quantity,
        image:   product.images?.[0] || '',
        seller:  product.seller,
      }];
    } else if (items) {
      // Cart checkout — validate all items
      for (const item of items) {
        const p = await Product.findById(item.product || item._id);
        if (!p) return res.status(404).json({ success:false, message:`Product not found` });
        totalAmount += p.price * item.qty;
        orderItems.push({ product:p._id, name:p.name, price:p.price, qty:item.qty, image:p.images?.[0]||'', seller:p.seller });
      }
    } else {
      totalAmount = amount; // Fallback
    }

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });

    // Pre-create DB order in pending state
    const dbOrder = await Order.create({
      buyer:           req.user.id,
      items:           orderItems,
      shippingAddress: shippingAddress || {},
      totalAmount,
      paymentMethod:   'razorpay',
      razorpayOrderId: rzpOrder.id,
    });

    res.json({
      success:  true,
      orderId:  rzpOrder.id,
      dbOrderId:dbOrder._id,
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create error:', err);
    res.status(500).json({ success:false, message: err.message || 'Payment initiation failed' });
  }
};

// ── VERIFY RAZORPAY PAYMENT ───────────────────────────────────────────────────
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;

    // Verify signature
    const body      = razorpayOrderId + '|' + razorpayPaymentId;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success:false, message:'Payment verification failed — invalid signature' });
    }

    // Update order
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'success',
        status:        'confirmed',
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success:false, message:'Order not found' });

    // Deduct stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty, numSales: item.qty },
      });
    }

    res.json({ success:true, message:'Payment verified successfully', order });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ success:false, message:err.message });
  }
};