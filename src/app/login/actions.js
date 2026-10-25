'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkPassword } from '@/lib/login';
import { SESSION_COOKIE, SESSION_DAYS, createSessionToken } from '@/lib/session';

export async function loginAction(_prev, formData) {
  const res = await checkPassword(formData.get('password'));
  if (res.error) return res;

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
