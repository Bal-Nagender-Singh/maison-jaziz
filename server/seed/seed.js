import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { prisma } from '../config/db.js';
import { products } from './products.js';
import { uploadProductImage } from '../utils/cloudinary.js';

const seedCategories = [
  { name: 'Attars', slug: 'attars', description: 'Concentrated perfume oils showcasing traditional Arabian blending.', imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=88', sortOrder: 0 },
  { name: 'Eau de Parfum', slug: 'eau-de-parfum', description: 'Luminous and opulent sprays with exceptional sillage and longevity.', imageUrl: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=1200&q=88', sortOrder: 1 },
  { name: 'Oud Collection', slug: 'oud-collection', description: 'Rare resinous oud compositions crafted for unforgettable presence.', imageUrl: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=88', sortOrder: 2 },
  { name: 'Gift Sets', slug: 'gift-sets', description: 'Exquisite pairings and discovery coffrets for giving and collecting.', imageUrl: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=88', sortOrder: 3 },
  { name: 'Luxury Oils', slug: 'luxury-oils', description: 'Intimate, pure oil formulations that melt into the skin.', imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=88', sortOrder: 4 },
  { name: 'Signature Scents', slug: 'signature-scents', description: 'The defining creations of the Maison, celebrated worldwide.', imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=88', sortOrder: 5 },
  { name: 'Premium', slug: 'premium', description: 'Our most exclusive and premium fragrances.', imageUrl: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=88', sortOrder: 6 }
];

const categoryMapping = {
  'jaziz-noir': 'oud-collection',
  'rose-sultana': 'eau-de-parfum',
  'amber-palace': 'eau-de-parfum',
  'oud-royale': 'oud-collection',
  'velvet-mirage': 'signature-scents',
  'citrus-dor': 'signature-scents',
  'musk-imperial': 'signature-scents',
  'iris-majestic': 'signature-scents'
};

try {
  await connectDB();

  // Seed compulsory default slide
  const defaultSlideId = '00000000-0000-0000-0000-000000000001';
  const defaultSlideExisting = await prisma.heroSlide.findUnique({ where: { id: defaultSlideId } });
  let slideImageUrl = defaultSlideExisting?.imageUrl || 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=88';
  let slideImagePublicId = defaultSlideExisting?.imagePublicId || null;

  if (!slideImagePublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const response = await fetch('https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=88');
      if (response.ok) {
        const uploaded = await uploadProductImage(Buffer.from(await response.arrayBuffer()));
        slideImageUrl = uploaded.secure_url;
        slideImagePublicId = uploaded.public_id;
      }
    } catch (err) {
      console.error('Failed to upload default slide image to Cloudinary:', err);
    }
  }

  await prisma.heroSlide.upsert({
    where: { id: defaultSlideId },
    update: {
      title: 'Royal fragrances crafted for unforgettable presence.',
      subtitle: 'Precious oud, luminous saffron and velvet florals, composed as an olfactory heirloom for those whose presence lingers.',
      imageUrl: slideImageUrl,
      imagePublicId: slideImagePublicId,
      ctaLabel: 'Shop Collection',
      ctaUrl: '/collection',
      active: true,
      sortOrder: 0
    },
    create: {
      id: defaultSlideId,
      title: 'Royal fragrances crafted for unforgettable presence.',
      subtitle: 'Precious oud, luminous saffron and velvet florals, composed as an olfactory heirloom for those whose presence lingers.',
      imageUrl: slideImageUrl,
      imagePublicId: slideImagePublicId,
      ctaLabel: 'Shop Collection',
      ctaUrl: '/collection',
      active: true,
      sortOrder: 0
    }
  });
  console.log('Seeded compulsory default slide.');
  
  // Seed categories
  const dbCategories = {};
  for (const cat of seedCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
    dbCategories[cat.slug] = created.id;
  }
  console.log(`Seeded ${seedCategories.length} categories.`);

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    let imageUrl = existing?.imageUrl || '';
    let imagePublicId = existing?.imagePublicId || null;
    if (!imagePublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const response = await fetch(product.image);
      if (!response.ok) throw new Error(`Could not fetch seed image for ${product.name}`);
      const uploaded = await uploadProductImage(Buffer.from(await response.arrayBuffer()));
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    }
    
    const targetCategorySlug = categoryMapping[product.slug];
    const categoryId = targetCategorySlug ? dbCategories[targetCategorySlug] : null;

    const sizes = [
      { size: '50ml', price: Math.round(product.price * 0.75), stock: 15 },
      { size: product.size || '75ml', price: product.price, stock: product.stock },
      { size: '100ml', price: Math.round(product.price * 1.3), stock: 10 }
    ];

    const data = { 
      ...product, 
      imageUrl, 
      imagePublicId, 
      imageAlt: `${product.name} perfume bottle`,
      categoryId,
      stock: sizes.reduce((sum, s) => sum + s.stock, 0)
    };
    delete data.image;
    const createdProduct = await prisma.product.upsert({ where: { slug: data.slug }, update: data, create: data });

    await prisma.productSize.deleteMany({ where: { productId: createdProduct.id } });
    await prisma.productSize.createMany({
      data: sizes.map(s => ({
        productId: createdProduct.id,
        size: s.size,
        price: s.price,
        stock: s.stock
      }))
    });
  }
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@masionjaziz.com').toLowerCase();
  await prisma.user.upsert({ where: { email: adminEmail }, update: { role: 'admin' }, create: { email: adminEmail, role: 'admin' } });
  console.log(`Seeded ${products.length} fragrances. Admin OTP email: ${adminEmail}`);

  // Seed default settings
  const defaultSettings = [
    { key: 'instagram_handle', value: 'masionjaziz' },
    { key: 'google_maps_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.7335688562305!2d75.7946979!3d26.911874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db421ab71ebbb%3A0xb304e222e8ec53f5!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1719331000000!5m2!1sen!2sin' },
    { key: 'facebook_handle', value: 'masionjaziz' },
    { key: 'store_email', value: 'contact@masionjaziz.com' },
    { key: 'store_phone', value: '+91 98765 43210' }
  ];
  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }
  console.log('Seeded default store settings.');
} catch (error) { console.error(error); process.exitCode = 1; } finally { await prisma.$disconnect(); }
