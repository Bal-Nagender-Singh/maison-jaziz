import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

export const uploadProductImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder: 'masion-jaziz/products', resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] }, (error, result) => error ? reject(error) : resolve(result));
  stream.end(buffer);
});
export const destroyImage = async (publicId) => publicId ? cloudinary.uploader.destroy(publicId) : null;
