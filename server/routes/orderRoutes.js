import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { allOrders, myOrders, updateOrderStatus } from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';
const router = Router();
router.get('/my-orders', protect, asyncHandler(myOrders));
router.get('/admin', protect, adminOnly, asyncHandler(allOrders));
router.put('/admin/:id/status', protect, adminOnly, asyncHandler(updateOrderStatus));
export default router;
