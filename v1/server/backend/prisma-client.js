// Simple CommonJS Prisma client singleton for backend processes
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  if (!global.__prisma) global.__prisma = new PrismaClient();
  prisma = global.__prisma;
} catch (err) {
  // Prisma not installed or not configured; exports undefined to allow fallback
  prisma = undefined;
}

module.exports = prisma;
