import { verifyToken, getTokenFromRequest } from './jwt';
import { NextResponse } from 'next/server';
import connectDB from '../db/mongoose';
import User from '../db/models/User';

/**
 * Wraps an API route handler with authentication.
 * Usage: export const GET = withAuth(async (request, context, user) => { ... });
 * @param {Function} handler - async (request, context, user) => NextResponse
 * @param {Object} options
 * @param {string[]} options.roles - allowed roles; empty = any authenticated user
 */
export function withAuth(handler, options = {}) {
  return async function (request, context) {
    try {
      const token = getTokenFromRequest(request);

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      let decoded;
      try {
        decoded = verifyToken(token);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired session. Please log in again.' },
          { status: 401 }
        );
      }

      await connectDB();
      const user = await User.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User account not found.' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Your account has been deactivated. Contact support.' },
          { status: 403 }
        );
      }

      if (options.roles?.length && !options.roles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to perform this action.' },
          { status: 403 }
        );
      }

      return handler(request, context, user);
    } catch (error) {
      console.error('[Auth Middleware]', error);
      return NextResponse.json(
        { success: false, error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }
  };
}

/**
 * Optionally authenticate — user may be null if not logged in.
 */
export function withOptionalAuth(handler) {
  return async function (request, context) {
    try {
      const token = getTokenFromRequest(request);
      let user = null;

      if (token) {
        try {
          const decoded = verifyToken(token);
          await connectDB();
          user = await User.findById(decoded.userId).lean();
        } catch {
          // Ignore invalid token for optional auth
        }
      }

      return handler(request, context, user);
    } catch (error) {
      console.error('[Optional Auth Middleware]', error);
      return NextResponse.json(
        { success: false, error: 'Server error.' },
        { status: 500 }
      );
    }
  };
}

/**
 * Shorthand for admin-only routes.
 */
export function withAdmin(handler) {
  return withAuth(handler, { roles: ['admin'] });
}

export function setCookieHeader(token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `agrimitra_token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function clearCookieHeader() {
  return `agrimitra_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
