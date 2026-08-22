import { NextRequest, NextResponse } from 'next/server';

import {
  createSignedSessionValue,
  sessionCookieName,
  sessionCookieOptions,
} from '@/lib/auth/session';

/**
 * Middleware (Technical-Architecture §5):
 *  - Issues the signed `session_id` (anon identity) cookie if absent.
 *  - UX-only redirects (NOT an auth gate): /admin and /account without a
 *    session cookie are redirected so the login flow is reachable.
 *  - Basic security headers (CSP is refined per-route later).
 *
 * Real authorization happens in Server Actions via requireJwt/requireRole/
 * requirePermission (src/lib/auth/require.ts) against the verified Supabase
 * JWT — never here.
 */

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const cookieName = sessionCookieName();
    const existing = request.cookies.get(cookieName);

    // 1) Anonymous session cookie (signed), 2-year TTL.
    if (!existing?.value) {
      try {
        const value = await createSignedSessionValue();
        response.cookies.set(cookieName, value, sessionCookieOptions());
      } catch (cookieErr) {
        console.warn('[middleware] session cookie generation warning:', cookieErr);
      }
    }

    // 2) UX-only redirects for protected-area entry points.
    const pathname = request.nextUrl.pathname;
    if (!existing?.value) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // 3) Baseline hardening headers.
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return response;
  } catch (err) {
    console.error('[middleware] unhandled middleware error:', err);
    // Never crash with 500 MIDDLEWARE_INVOCATION_FAILED — pass through gracefully
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets, images, fonts, favicon and
     * Next internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};