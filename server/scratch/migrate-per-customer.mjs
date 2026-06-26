import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  await prisma.$executeRawUnsafe(`ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "per_customer" BOOLEAN NOT NULL DEFAULT false`);
  console.log('Migration successful: per_customer column added to coupons table');
} catch(e) {
  if (e.message && e.message.includes('already exists')) {
    console.log('Column per_customer already exists, skipping');
  } else {
    console.error('Migration error:', e.message);
  }
} finally {
  await prisma.$disconnect();
}
