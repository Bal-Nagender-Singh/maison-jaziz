import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) });
router.post('/product-image', protect, adminOnly, upload.single('image'), asyncHandler(uploadImage));
export default router;
