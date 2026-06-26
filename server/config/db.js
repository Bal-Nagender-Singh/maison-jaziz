import { PrismaClient } from '@prisma/client';

export const prisma = globalThis.__masionPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__masionPrisma = prisma;

export const connectDB = async () => {
  await prisma.$connect();
  console.log('PostgreSQL connected');
};
