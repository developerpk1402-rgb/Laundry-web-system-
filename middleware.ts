
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  // 1. Public Routes
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // 2. Auth Check
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. RBAC Check (Conceptual: In real app, decode JWT here)
  if (pathname.startsWith('/settings') && !request.cookies.get('isAdmin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
