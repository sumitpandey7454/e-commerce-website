const express = require('express');
const router  = express.Router();
const {
  createOrder, getMyOrders, getSellerOrders,
  getAllOrders, getOrder, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/',              protect, authorize('buyer'),          createOrder);
router.get('/my',             protect, authorize('buyer'),          getMyOrders);
router.get('/seller',         protect, authorize('seller'),         getSellerOrders);
router.get('/admin/all',      protect, authorize('admin'),          getAllOrders);
router.get('/:id',            protect,                              getOrder);
router.put('/:id/status',     protect, authorize('seller','admin'), updateOrderStatus);

module.exports = router;