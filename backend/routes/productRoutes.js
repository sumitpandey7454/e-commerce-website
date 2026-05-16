const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, getMyProducts,
  createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public
router.get('/',          getProducts);
router.get('/:id',       getProduct);

// Seller only
router.get('/seller/me', protect, authorize('seller'), getMyProducts);
router.post('/',         protect, authorize('seller'), upload.array('images', 5), createProduct);
router.put('/:id',       protect, authorize('seller','admin'), upload.array('images', 5), updateProduct);
router.delete('/:id',    protect, authorize('seller','admin'), deleteProduct);

// Buyer - add review
router.post('/:id/reviews', protect, authorize('buyer'), addReview);

module.exports = router;