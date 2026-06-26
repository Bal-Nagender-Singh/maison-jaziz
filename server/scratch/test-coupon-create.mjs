import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Test creating a coupon with the same data the controller would use
const testData = {
  code: 'TEST10',
  description: '',
  discountType: 'percent',
  value: 10,
  scope: 'all',
  categoryId: null,
  productId: null,
  minimumOrder: 0,
  maximumDiscount: null,
  active: true,
  startsAt: null,
  expiresAt: null,
  usageLimit: null,
};

try {
  console.log('Attempting to create coupon...');
  const created = await prisma.coupon.create({ data: testData });
  console.log('SUCCESS! Created coupon:', created.id, created.code);
  
  // Test perCustomer raw update
  await prisma.$executeRawUnsafe(`UPDATE "coupons" SET "per_customer"=$1 WHERE id=$2::uuid`, false, created.id);
  console.log('perCustomer update OK');
  
  // Cleanup
  await prisma.coupon.delete({ where: { id: created.id } });
  console.log('Cleaned up test coupon');
} catch(e) {
  console.error('ERROR:', e.message);
  console.error('Code:', e.code);
} finally {
  await prisma.$disconnect();
}
