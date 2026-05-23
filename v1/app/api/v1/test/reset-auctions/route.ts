import { NextResponse } from 'next/server';
import { resetLiveAuctions } from '@/lib/auctions';

export async function POST() {
  resetLiveAuctions();
  return NextResponse.json({ success: true });
}