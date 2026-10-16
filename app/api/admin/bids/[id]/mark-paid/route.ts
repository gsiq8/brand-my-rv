import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { markPaid } from '@/lib/server/bids';

// Use after you collected the balance yourself (phone call, wire, Pix, cash…). Publishes the logo.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;

  try {
  const result = await markPaid(id);
  return NextResponse.json({ ok: true, result });
} catch (e) {
  console.error('mark-paid failed', e);
  return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
}
}
