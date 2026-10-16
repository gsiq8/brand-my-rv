import { NextResponse } from 'next/server';
import { db } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

// POST = count a new visit (the page calls this once per browser session). GET = just read the number.
export async function POST() {
  const { data, error } = await db().rpc('increment_visits');
  if (error) { console.error('visit POST', error); return NextResponse.json({ error: 'failed' }, { status: 500 }); }
  return NextResponse.json({ visitors: Number(data) });
}

export async function GET() {
  const { data, error } = await db().from('site_stats').select('value').eq('key', 'visits').single();
  if (error || !data) { console.error('visit GET', error); return NextResponse.json({ error: 'failed' }, { status: 500 }); }
  return NextResponse.json({ visitors: Number(data.value) });
}
