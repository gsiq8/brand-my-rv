import { timingSafeEqual } from 'crypto';

export function isAdmin(req: Request) {
  const given = Buffer.from(req.headers.get('x-admin-secret') ?? '');
  const real = Buffer.from(process.env.ADMIN_SECRET ?? '');
  return real.length > 0 && given.length === real.length && timingSafeEqual(given, real);
}
