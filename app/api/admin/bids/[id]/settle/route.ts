import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { settleBid } from '@/lib/server/auction';

// Use when the wire has arrived. Releases the card hold and closes the spot as sold.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  try {
    await settleBid(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('settle failed', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}