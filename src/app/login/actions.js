'use server';

import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SESSION_COOKIE, SESSION_DAYS, createSessionToken } from '@/lib/session';

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

export async function loginAction(_prev, formData) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return { error: 'DASHBOARD_PASSWORD is not set on the server.' };

  const ip = await clientIp();
  if ((await recentFails(ip)) >= MAX_FAILS) {
    return { error: `Too many attempts. Try again in ${WINDOW_MIN} minutes.` };
  }

  if (!samePassword(formData.get('password') || '', expected)) {
    await supabase.from('login_attempts').insert({ ip });
    await new Promise((r) => setTimeout(r, 800));
    return { error: 'Wrong password.' };
  }

  await supabase.from('login_attempts').delete().eq('ip', ip);
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 86400,
    path: '/',
  });
  redirect('/dashboard');
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
