import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('credentials'); // Get auth token from cookies

  // Handle the `/auth` route
  if (pathname.startsWith('/auth')) {
    if (token) {
      // If the user is already authenticated, redirect to the homepage
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Handle all other routes
  if (!pathname.startsWith('/auth')) {
    // If the user doesn't have a valid token, redirect to `/auth` route
    if (!token) {
      return NextResponse.redirect(new URL('/auth', req.url)); // Redirect to login page
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth','/profile','/messages'], // Routes where middleware will be applied
};
