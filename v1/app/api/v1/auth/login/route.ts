import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../../lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email : null;
  const password = typeof body.password === 'string' ? body.password : null;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }

  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
  const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret';
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: '7d' });

  const res = NextResponse.json({ success: true, data: { user: safe, message: 'Login successful' } });
  res.cookies.set('tm_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}