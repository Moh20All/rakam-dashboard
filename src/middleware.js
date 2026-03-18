import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('rakam_auth_token');
  
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token || token.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname === '/login' && token?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
