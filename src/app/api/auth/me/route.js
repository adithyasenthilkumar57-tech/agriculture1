import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { clearCookieHeader } from '@/lib/auth/middleware';

// POST /api/auth/logout
export const POST = withAuth(async (request, context, user) => {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.headers.set('Set-Cookie', clearCookieHeader());
  return response;
});

// GET /api/auth/me
export const GET = withAuth(async (request, context, user) => {
  return NextResponse.json({ success: true, user });
});
