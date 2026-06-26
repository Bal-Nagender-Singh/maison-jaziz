import { prisma } from '../config/db.js';

async function main() {
  try {
    const coupons = await prisma.coupon.findMany();
    console.log('Coupons:', coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
