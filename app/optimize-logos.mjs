import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: bids, error } = await db.from('bids').select('id, logo_path').like('logo_path', '%.png');
if (error) throw error;

for (const b of bids) {
  const { data: blob, error: dl } = await db.storage.from('logos').download(b.logo_path);
  if (dl) { console.error('skip', b.logo_path, dl.message); continue; }
  const src = Buffer.from(await blob.arrayBuffer());
  const full = await sharp(src).resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const thumb = await sharp(src).resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();

  const path = b.logo_path.replace(/\.png$/, '.webp');
  const opts = { contentType: 'image/webp', upsert: true, cacheControl: '31536000' };
  await db.storage.from('logos').upload(path, full, opts);
  await db.storage.from('logos').upload(path.replace(/\.webp$/, '-sm.webp'), thumb, opts);
  await db.from('bids').update({ logo_path: path }).eq('id', b.id);
  console.log('ok', path);
}
// Once the site looks right, delete the old .png files from the 'logos' bucket.