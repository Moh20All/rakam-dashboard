import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const signedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith('/dashboard') && !signedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname === '/login' && signedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
