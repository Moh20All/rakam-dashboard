// Password check shared by the website login and the mobile app login (/api/admin/login).
import crypto from 'crypto';
import { headers } from 'next/headers';
import { supabase } from './supabase';

const MAX_FAILS = 5;
const WINDOW_MIN = 15;

async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim();
}

// Compares hashes so the time taken does not reveal how much of the password matched
function samePassword(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Failed attempts live in the login_attempts table (see supabase/dashboard-upgrade.sql).
// If the table does not exist yet, login still works, just without the lockout.
async function recentFails(ip) {
  const since = new Date(Date.now() - WINDOW_MIN * 60000).toISOString();
  const { count, error } = await supabase
    .from('login_attempts').select('id', { count: 'exact', head: true })
    .eq('ip', ip).gte('created_at', since);
  return error ? 0 : count || 0;
}

/** { ok: true } or { error } — with lockout after too many wrong passwords */
export async function checkPassword(password) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return { error: 'DASHBOARD_PASSWORD is not set on the server.' };

  const ip = await clientIp();
  if ((await recentFails(ip)) >= MAX_FAILS) {
    return { error: `Too many attempts. Try again in ${WINDOW_MIN} minutes.` };
  }

  if (!samePassword(password || '', expected)) {
    await supabase.from('login_attempts').insert({ ip });
    await new Promise((r) => setTimeout(r, 800));
    return { error: 'Wrong password.' };
  }

  await supabase.from('login_attempts').delete().eq('ip', ip);
  return { ok: true };
}
