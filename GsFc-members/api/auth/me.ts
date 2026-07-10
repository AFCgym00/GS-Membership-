import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return; // requireUser already sent a 401

  return res.status(200).json({ user: { email: user.email, role: user.role } });
}
