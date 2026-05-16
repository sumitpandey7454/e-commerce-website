const Product = require('../models/Product');

// ── GET ALL PRODUCTS (with filters, search, pagination) ───────────────────────
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort = '-createdAt',
            featured, inStock, page = 1, limit = 12, seller } = req.query;

    const query = { status: 'active' };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (seller) query.seller = seller;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('seller', 'name storeName avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET SINGLE PRODUCT ────────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name storeName avatar')
      .populate('reviews.user', 'name avatar');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET SELLER'S OWN PRODUCTS ─────────────────────────────────────────────────
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort('-createdAt');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE PRODUCT ────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, brand, stock, tags, featured } = req.body;

    const images = req.files ? req.files.map(f => f.path) : [];
    const tagsArr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const product = await Product.create({
      name, description,
      price:         Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category, brand,
      stock:         Number(stock),
      seller:        req.user.id,
      images,
      tags:          tagsArr,
      featured:      featured === 'true',
    });

    await product.populate('seller', 'name storeName');
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── UPDATE PRODUCT ────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Only seller who owns it or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files?.length > 0) updates.images = req.files.map(f => f.path);
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('seller', 'name storeName');

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE PRODUCT ────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADD REVIEW ────────────────────────────────────────────────────────────────
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const already = product.reviews.find(r => r.user.toString() === req.user.id);
    if (already) return res.status(400).json({ success: false, message: 'You already reviewed this product' });

    product.reviews.push({ user: req.user.id, name: req.user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};