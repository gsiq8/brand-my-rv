import { NextResponse } from 'next/server';
import { closeDueAuctions, defaultDueAuctions } from '@/lib/server/auction';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
    return new NextResponse('Unauthorized', { status: 401 });
  const closed = await closeDueAuctions();
  const defaulted = await defaultDueAuctions();
  return NextResponse.json({ closed, defaulted });
}