import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/mongodb.js';
import { requireAdmin } from '../_lib/auth.js';
import { serializeMember, type MemberDoc } from '../_lib/serialize.js';

const WRITABLE_FIELDS = [
  'member_id',
  'name',
  'gender',
  'wing_flat',
  'phone',
  'whatsapp',
  'photo_url',
  'email',
  'ownership',
  'preferred_timing',
  'plan',
  'duration',
  'start_date',
  'end_date',
  'status',
  'paid',
  'payment_type',
  'remark',
  'registered_on',
] as const;

const DATE_FIELDS = new Set(['start_date', 'end_date', 'registered_on']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const { id } = req.query;
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid member id' });
  }
  const _id = new ObjectId(id);

  const db = await getDb();
  const members = db.collection<MemberDoc>('members');

  if (req.method === 'PUT') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    for (const field of WRITABLE_FIELDS) {
      if (!(field in body)) continue;
      const value = body[field];
      updates[field] = DATE_FIELDS.has(field) && typeof value === 'string' ? new Date(value) : value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    try {
      const result = await members.findOneAndUpdate(
        { _id },
        { $set: updates },
        { returnDocument: 'after' }
      );

      if (!result) return res.status(404).json({ error: 'Member not found' });
      return res.status(200).json({ member: serializeMember(result) });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
        return res.status(409).json({ error: 'That Member ID is already in use' });
      }
      throw err;
    }
  }

  if (req.method === 'DELETE') {
    const result = await members.deleteOne({ _id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Member not found' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
