import express from 'express';
import {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders')
    .get(protect, getMyOrders);

router.get('/latest-ready', async (req, res) => {
  try {
    const order = await Order.findOne({ status: 'Ready for Pickup' })
      .sort({ createdAt: -1 })
      .populate('user', 'name studentId');
    if (!order) return res.status(404).json({ message: 'No ready orders' });
    res.json({
      token: order.tokenNumber,
      status: order.status,
      studentName: order.user ? order.user.name : 'Unknown',
      items: order.orderItems.map(i => i.name).join(', '),
      amount: order.totalPrice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

export default router;
