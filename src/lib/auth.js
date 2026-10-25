import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './session';

/**
 * Every server action calls this first. Server actions are public POST endpoints, so the
 * proxy redirect alone is not enough to protect them.
 */
export async function requireAdmin() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    throw new Error('Not signed in');
  }
}
