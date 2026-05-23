import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAdminFromRequest } from '@/lib/serverAuth';

export async function PUT(request: Request, context?: { params?: { id?: string } }) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }

  try {
    const idFromParams = context?.params?.id;
    const idFromUrl = new URL(request.url).pathname.split('/').filter(Boolean).pop();
    const id = Number(idFromParams ?? idFromUrl);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ success: false, message: 'invalid id' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as { name?: string; slug?: string; description?: string; price?: number };
    const product = await prisma.product.update({
      where: { id },
      data: { name: body.name, slug: body.slug, description: body.description, price: body.price },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'failed to update product', error: (error as Error).message }, { status: 500 });
  }
}
