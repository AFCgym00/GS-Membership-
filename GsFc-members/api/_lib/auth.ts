import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable.');
}

export const SESSION_COOKIE = 'afc_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

/** Signs a session JWT for the given user. */
export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET as string, { expiresIn: SESSION_MAX_AGE_SECONDS });
}

/** Builds the Set-Cookie header value that stores the session as an httpOnly cookie. */
export function buildSessionCookie(token: string): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

/** Builds a Set-Cookie header value that immediately clears the session cookie (for logout). */
export function buildClearedSessionCookie(): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

/**
 * Verifies the caller sent a valid session cookie (a signed JWT). This is
 * the real auth check for the API — a missing/expired/tampered cookie
 * results in a 401 and this returns null. Route handlers must return
 * immediately when this returns null (the response has already been sent).
 */
export async function requireUser(
  req: VercelRequest,
  res: VercelResponse
): Promise<SessionUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as SessionUser;
    return payload;
  } catch {
    res.status(401).json({ error: 'Session expired or invalid' });
    return null;
  }
}

/**
 * Same as requireUser, but additionally requires the user to hold the
 * 'admin' role (set on the user document at account-creation time — see
 * api/auth/login.ts and the users collection). Returns 403 for a valid but
 * non-admin session.
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<SessionUser | null> {
  const user = await requireUser(req, res);
  if (!user) return null;

  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required' });
    return null;
  }

  return user;
}
