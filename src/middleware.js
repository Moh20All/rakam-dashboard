import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('rakam_auth_token');
  
  // Removed redirection from '/' to allow viewing the landing page

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
