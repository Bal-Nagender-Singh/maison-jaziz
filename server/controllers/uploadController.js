import { uploadProductImage } from '../utils/cloudinary.js';

export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a JPEG, PNG, WebP, or AVIF image' });
  const result = await uploadProductImage(req.file.buffer);
  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
};
