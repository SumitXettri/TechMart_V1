import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof globalThis & { __prisma?: PrismaClient };

const _global = globalThis as GlobalWithPrisma;
const prisma = _global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') _global.__prisma = prisma;

export default prisma;
