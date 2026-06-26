import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  // Check what's in DB now
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  console.log('Coupons in DB:', coupons.length);
  coupons.forEach(c => console.log(' -', c.code, c.discountType, Number(c.value)));
  
  // Test the $queryRaw approach (check for BigInt issue)
  const rows = await prisma.$queryRaw`SELECT c.* FROM "coupons" c ORDER BY c.created_at DESC LIMIT 5`;
  console.log('\nRaw query rows:', rows.length);
  if (rows[0]) {
    const types = Object.entries(rows[0]).map(([k,v]) => `${k}: ${typeof v} (${v?.constructor?.name})`);
    types.forEach(t => console.log(' ', t));
    // Test JSON serialization
    try {
      JSON.stringify(rows[0]);
      console.log('\nJSON serialization: OK');
    } catch(e) {
      console.error('\nJSON serialization FAILED:', e.message);
    }
  }
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
}
