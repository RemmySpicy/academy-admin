/**
 * Authentication middleware for Academy Admin Frontend
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_STORAGE_KEY } from '@/lib/constants';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated
  const token = request.cookies.get(AUTH_STORAGE_KEY)?.value;
  const isAuthenticated = !!token;
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !publicRoutes.includes(pathname) && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};