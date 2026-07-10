import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/mongodb.js';
import { signSessionToken, buildSessionCookie } from '../_lib/auth.js';

interface UserDoc {
  _id: unknown;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const db = await getDb();
  const user = await db.collection<UserDoc>('users').findOne({ email });

  // Deliberately generic error for both "no such user" and "wrong password"
  // so the response doesn't reveal which emails have accounts.
  const invalidMessage = 'Invalid email or password';

  if (!user) {
    return res.status(401).json({ error: invalidMessage });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: invalidMessage });
  }

  const token = signSessionToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  res.setHeader('Set-Cookie', buildSessionCookie(token));
  return res.status(200).json({ user: { email: user.email, role: user.role } });
}
