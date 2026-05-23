import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../../lib/db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name : null;
  const email = typeof body.email === 'string' ? body.email : null;
  const password = typeof body.password === 'string' ? body.password : null;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hashed } });

  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  return NextResponse.json({ success: true, data: { user: safe, message: 'User created' } });
}