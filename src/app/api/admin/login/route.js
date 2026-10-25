import { NextResponse } from 'next/server';
import { checkPassword } from '@/lib/login';
import { createSessionToken } from '@/lib/session';

// The mobile app stays signed in longer than the website (it is on the owner's own phone)
const APP_SESSION_DAYS = 30;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const res = await checkPassword(body.password);
  if (res.error) return NextResponse.json(res, { status: 401 });
  const token = await createSessionToken(APP_SESSION_DAYS);
  return NextResponse.json({ token, expiresAt: Number(token.split('.')[0]) });
}
