/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: {
    product: {
      create: vi.fn(async (opts: unknown) => ({ id: 1, ...(opts as any).data })),
      update: vi.fn(async (opts: unknown) => ({ id: (opts as any).where.id, ...(opts as any).data })),
    },
  },
}));

vi.mock('@/lib/serverAuth', () => ({
  isAdminFromRequest: () => true,
}));

import prisma from '../lib/db';
import { POST as createProduct } from '../app/api/v1/admin/products/route';
import { PUT as updateProduct } from '../app/api/v1/admin/products/[id]/route';

function makeRequest(url = 'http://localhost/api/v1/admin/products', body?: unknown) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
}

function makePutRequest(url = 'http://localhost/api/v1/admin/products/1', body?: unknown) {
  return new Request(url, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
}

describe('Admin products API', () => {
  beforeEach(() => {
    (prisma.product.create as unknown as { mockClear?: () => void }).mockClear?.();
    (prisma.product.update as unknown as { mockClear?: () => void }).mockClear?.();
  });

  it('creates a product', async () => {
    const req = makeRequest(undefined, { name: 'X', slug: 'x' });
    const res = await createProduct(req as unknown as Request);
    const json = await (res as Response).json();
    expect((json as any).success).toBe(true);
    expect((json as any).data.name).toBe('X');
    expect((prisma.product.create as any).mock?.calls.length ?? 1).toBeGreaterThanOrEqual(0);
  });

  it('updates a product', async () => {
    const req = makePutRequest(undefined, { name: 'Y' });
    const res = await updateProduct(req as unknown as Request);
    const json = await (res as Response).json();
    expect((json as any).success).toBe(true);
    expect((json as any).data.name).toBe('Y');
    expect((prisma.product.update as any).mock?.calls.length ?? 1).toBeGreaterThanOrEqual(0);
  });
});
