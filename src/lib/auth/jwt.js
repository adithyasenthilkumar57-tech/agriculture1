import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.warn('[AgriMitra] JWT_SECRET not set. Auth features will be unavailable.');
}

export function signToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, JWT_SECRET);
}

export function getTokenFromRequest(request) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Try cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)agrimitra_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}
