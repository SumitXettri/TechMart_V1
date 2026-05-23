import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('adminpass', 10);
  console.log('Seeding admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@techmart.local' },
    update: { password: pw, role: 'admin' },
    create: { email: 'admin@techmart.local', password: pw, role: 'admin', name: 'TechMart Admin' },
  });

  console.log('Seeding products...');
  const prod = await prisma.product.upsert({
    where: { slug: 'sample-product' },
    update: {
      name: 'Sample Product',
      brand: 'TechMart',
      category: 'Cameras',
      description: 'Seeded sample product',
    },
    create: {
      name: 'Sample Product',
      slug: 'sample-product',
      brand: 'TechMart',
      category: 'Cameras',
      description: 'Seeded sample product',
    },
  });

  console.log('Seeding variant...');
  const variant = await prisma.productVariant.upsert({
    where: { sku: 'TM-SAMPLE-001' },
    update: {
      productId: prod.id,
      price: new Prisma.Decimal(9999),
      stock: 3,
      isActive: true,
      metadata: JSON.stringify({ seeded: true }),
    },
    create: {
      productId: prod.id,
      sku: 'TM-SAMPLE-001',
      price: new Prisma.Decimal(9999),
      stock: 3,
      isActive: true,
      metadata: JSON.stringify({ seeded: true }),
    },
  });

  console.log('Seeding auction...');
  const auctionPayload = {
    productVariantId: variant.id,
    currentHighestBid: new Prisma.Decimal(10000),
    minBidIncrement: new Prisma.Decimal(500),
    totalBids: 0,
    endTime: new Date(Date.now() + 1000 * 60 * 60),
    version: 1,
    status: 'live',
  };

  const existingAuction = await prisma.auction.findFirst({ where: { productVariantId: variant.id } });
  if (existingAuction) {
    await prisma.auction.update({ where: { id: existingAuction.id }, data: auctionPayload });
  } else {
    await prisma.auction.create({ data: auctionPayload });
  }

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
