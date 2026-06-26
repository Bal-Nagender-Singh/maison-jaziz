import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createRazorpayOrder, verifyRazorpayPayment, createCodOrder } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.post('/create-razorpay-order', protect, asyncHandler(createRazorpayOrder));
router.post('/verify-razorpay-payment', protect, asyncHandler(verifyRazorpayPayment));
router.post('/create-cod-order', protect, asyncHandler(createCodOrder));
export default router;
