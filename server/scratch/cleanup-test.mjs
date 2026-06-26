import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const all = await prisma.coupon.findMany();
  console.log('All coupons in DB:', all.length);
  all.forEach(c => console.log(`  ${c.code} | ${c.discountType} | ${c.value}`));
  
  // Clean up test coupons  
  const deleted = await prisma.coupon.deleteMany({ where: { code: { startsWith: 'TESTAPI' } } });
  console.log('Deleted test coupons:', deleted.count);
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
}
