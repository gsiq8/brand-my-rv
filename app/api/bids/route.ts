import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { data, error } = await db().from('bids')
    .select('id, spot_id, display_name, amount, currency, status, created_at, logo_approved, upload_path, website, bidders(name, phone, email, address, tax_id)')
    .in('status', ['awaiting_payment', 'review', 'paid', 'won'])
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const bids = await Promise.all((data ?? []).map(async ({ upload_path, ...b }) => ({
    ...b,
    logoUrl: (await db().storage.from('logo-uploads').createSignedUrl(upload_path, 3600)).data?.signedUrl ?? null,
  })));
  return NextResponse.json({ bids });
}