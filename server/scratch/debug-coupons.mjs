import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  // Test the raw query approach
  const rows = await prisma.$queryRaw`SELECT c.*,cat.name as cat_name,cat.id as cat_id FROM "coupons" c LEFT JOIN "categories" cat ON cat.id=c.category_id ORDER BY c.created_at DESC`;
  console.log('Row count:', rows.length);
  console.log('First row:', JSON.stringify(rows[0], (key, value) => typeof value === 'bigint' ? value.toString() : value));
  
  // Also test findMany
  const normal = await prisma.coupon.findMany({include:{category:true},orderBy:{createdAt:'desc'}});
  console.log('findMany count:', normal.length);
  console.log('First (normal):', JSON.stringify(normal[0]));
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
}
