import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { data, error } = await db().from('bids')
    .select('id, spot_id, display_name, amount, deposit, currency, status, payment_mode, created_at, bidders(name, phone, email, address, tax_id)')
    .in('status', ['pending_offer', 'invoiced', 'awaiting_payment'])
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bids: data });
}
