import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { approveLogo } from '@/lib/server/bids';

// Approve the logo. Refusing = use the Cancel button (it refunds).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  try {
    await approveLogo(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('logo-check failed', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}