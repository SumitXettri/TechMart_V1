import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAdminFromRequest } from '@/lib/serverAuth';

export async function POST(request: Request) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name: string; slug: string; description?: string; price?: number };
    const product = await prisma.product.create({ data: { name: body.name, slug: body.slug, description: body.description ?? '', price: body.price ?? 0 } });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, message: 'failed to create product' }, { status: 500 });
  }
}
