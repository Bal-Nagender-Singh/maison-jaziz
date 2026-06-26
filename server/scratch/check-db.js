import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { name: true, featured: true } });
  console.log(products);
}
main().catch(console.error).finally(() => prisma.$disconnect());
