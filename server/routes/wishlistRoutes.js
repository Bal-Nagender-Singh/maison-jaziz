import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, asyncHandler(getWishlist));
router.post('/', protect, asyncHandler(addToWishlist));
router.delete('/:productId', protect, asyncHandler(removeFromWishlist));

export default router;
