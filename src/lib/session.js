// Signed admin session cookie. Uses Web Crypto so it works in the proxy and in server actions.
//
// Cookie value: "<expiresAtMs>.<base64url HMAC-SHA256 of 'admin.<expiresAtMs>'>"
// The signing key is SESSION_SECRET, or (if unset) a hash of the dashboard password and the
// service-role key, so changing the password signs everyone out.

export const SESSION_COOKIE = 'warshati_admin';
export const SESSION_DAYS = 7;

const enc = new TextEncoder();

async function signingKey() {
  const secret = process.env.SESSION_SECRET
    || `${process.env.DASHBOARD_PASSWORD}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
  if (!process.env.SESSION_SECRET && !process.env.DASHBOARD_PASSWORD) {
    throw new Error('DASHBOARD_PASSWORD is not set');
  }
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function toB64url(buf) {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export async function createSessionToken(days = SESSION_DAYS) {
  const exp = Date.now() + days * 86400000;
  const sig = await crypto.subtle.sign('HMAC', await signingKey(), enc.encode(`admin.${exp}`));
  return `${exp}.${toB64url(sig)}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  try {
    return await crypto.subtle.verify('HMAC', await signingKey(), fromB64url(sig), enc.encode(`admin.${exp}`));
  } catch {
    return false;
  }
}
