import { cookies, headers } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './session';

/** The mobile admin app sends its session token as "Authorization: Bearer <token>". */
export async function bearerToken() {
  const h = await headers();
  const m = /^Bearer\s+(.+)$/i.exec(h.get('authorization') || '');
  return m ? m[1].trim() : null;
}

/**
 * Every server action calls this first. Server actions are public POST endpoints, so the
 * proxy redirect alone is not enough to protect them.
 * Accepts the website's session cookie or the mobile app's bearer token (same signed format).
 */
export async function requireAdmin() {
  const store = await cookies();
  if (await verifySessionToken(store.get(SESSION_COOKIE)?.value)) return;
  if (await verifySessionToken(await bearerToken())) return;
  throw new Error('Not signed in');
}
