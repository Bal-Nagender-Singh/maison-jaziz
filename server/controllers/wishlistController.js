import { prisma } from '../config/db.js';
import { productJson } from '../utils/presenters.js';

export const getWishlist = async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          sizes: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Return just the product details to make client consumption simple
  res.json(items.map(item => productJson(item.product)));
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  // Ensure product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId
      }
    }
  });

  if (existing) {
    return res.status(400).json({ message: 'Product is already in your wishlist.' });
  }

  const created = await prisma.wishlistItem.create({
    data: {
      userId: req.user.id,
      productId
    },
    include: {
      product: {
        include: {
          category: true,
          sizes: true
        }
      }
    }
  });

  res.status(201).json(productJson(created.product));
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ message: 'Product not found in your wishlist.' });
  }
};
