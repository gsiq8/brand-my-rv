export function normalizeUrl(input: string): string | null {
  let v = input.trim();
  if (!v || v.length > 300) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;   // "brand.com" -> "https://brand.com"
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.href;
  } catch { return null; }
}