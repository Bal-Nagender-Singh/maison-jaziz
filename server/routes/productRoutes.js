import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct, addProductImage, deleteProductImage } from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) });

router.get('/', asyncHandler(listProducts));
router.get('/:id', asyncHandler(getProduct));
router.post('/admin', protect, adminOnly, asyncHandler(createProduct));
router.put('/admin/:id', protect, adminOnly, asyncHandler(updateProduct));
router.delete('/admin/:id', protect, adminOnly, asyncHandler(deleteProduct));
// Gallery images
router.post('/admin/:id/images', protect, adminOnly, upload.single('image'), asyncHandler(addProductImage));
router.delete('/admin/:id/images/:imageId', protect, adminOnly, asyncHandler(deleteProductImage));

export default router;
