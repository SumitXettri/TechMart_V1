import { NextResponse } from 'next/server';

export function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('tm_session', { path: '/' });
  return res;
}
