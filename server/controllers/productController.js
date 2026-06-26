import { prisma } from '../config/db.js';
import { destroyImage, uploadProductImage } from '../utils/cloudinary.js';
import { productJson } from '../utils/presenters.js';
import { parse, productSchema } from '../utils/validation.js';

const INCLUDE = { category: true, sizes: true, images: true };

export const listProducts = async (req, res) => {
  const where = {};
  if (req.query.featured === 'true') where.featured = true;
  if (req.query.premium === 'true') where.premium = true;
  if (req.query.mostSelling === 'true') where.mostSelling = true;
  if (req.query.trending === 'true') where.trending = true;
  if (req.query.category) where.category = { slug: req.query.category };
  res.json((await prisma.product.findMany({ where, include: INCLUDE, orderBy: { createdAt: 'asc' } })).map(productJson));
};
export const getProduct = async (req, res) => {
  const product = await prisma.product.findFirst({ where: { OR: [{ slug: req.params.id }, ...(req.params.id.match(/^[0-9a-f-]{36}$/i) ? [{ id: req.params.id }] : [])] }, include: INCLUDE });
  if (!product) return res.status(404).json({ message: 'Fragrance not found' });
  res.json(productJson(product));
};
export const createProduct = async (req, res) => {
  const { sizes, ...productData } = parse(productSchema, req.body);
  const created = await prisma.product.create({
    data: {
      ...productData,
      sizes: {
        create: sizes || [{ size: productData.size, price: productData.price, stock: productData.stock }]
      }
    },
    include: INCLUDE
  });
  res.status(201).json(productJson(created));
};
export const updateProduct = async (req, res) => {
  const current = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ message: 'Fragrance not found' });
  const { sizes, ...productData } = parse(productSchema, req.body);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.productSize.deleteMany({ where: { productId: current.id } });
    return tx.product.update({
      where: { id: current.id },
      data: {
        ...productData,
        sizes: {
          create: sizes || [{ size: productData.size, price: productData.price, stock: productData.stock }]
        }
      },
      include: INCLUDE
    });
  });
  if (current.imagePublicId && current.imagePublicId !== updated.imagePublicId) destroyImage(current.imagePublicId).catch(console.error);
  res.json(productJson(updated));
};
export const deleteProduct = async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { images: true } });
  if (!product) return res.status(404).json({ message: 'Fragrance not found' });
  await prisma.product.delete({ where: { id: product.id } });
  if (product.imagePublicId) destroyImage(product.imagePublicId).catch(console.error);
  product.images?.forEach(img => img.publicId && destroyImage(img.publicId).catch(console.error));
  res.json({ message: 'Fragrance deleted' });
};

// --- Product Gallery Image endpoints ---
export const addProductImage = async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Fragrance not found' });
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  const result = await uploadProductImage(req.file.buffer);
  const existing = await prisma.productImage.count({ where: { productId: product.id } });
  const image = await prisma.productImage.create({
    data: { productId: product.id, url: result.secure_url, publicId: result.public_id, alt: req.body.alt || product.name, sortOrder: existing }
  });
  res.status(201).json({ id: image.id, url: image.url, publicId: image.publicId, alt: image.alt, sortOrder: image.sortOrder });
};

export const deleteProductImage = async (req, res) => {
  const image = await prisma.productImage.findFirst({ where: { id: req.params.imageId, productId: req.params.id } });
  if (!image) return res.status(404).json({ message: 'Image not found' });
  await prisma.productImage.delete({ where: { id: image.id } });
  if (image.publicId) destroyImage(image.publicId).catch(console.error);
  res.json({ message: 'Image deleted' });
};
