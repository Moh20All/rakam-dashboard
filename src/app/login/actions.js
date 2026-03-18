'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData) {
  const password = formData.get('password');
  const envPassword = process.env.DASHBOARD_PASSWORD;

  if (password === envPassword) {
    const cookieStore = await cookies();
    cookieStore.set('rakam_auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    redirect('/dashboard');
  }

  return { error: 'Invalid password' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('rakam_auth_token');
  redirect('/login');
}
