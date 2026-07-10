import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/mongodb.js';
import { requireAdmin } from '../_lib/auth.js';
import { serializeMember, type MemberDoc } from '../_lib/serialize.js';

function toDateOrNull(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const db = await getDb();
  const members = db.collection<MemberDoc>('members');

  if (req.method === 'GET') {
    const docs = await members.find().sort({ created_at: -1 }).toArray();
    return res.status(200).json({ members: docs.map(serializeMember) });
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const member_id = typeof body.member_id === 'string' && body.member_id.trim() ? body.member_id.trim() : null;

    if (member_id) {
      const existing = await members.findOne({ member_id });
      if (existing) {
        return res.status(409).json({ error: `Member ID "${member_id}" already exists` });
      }
    }

    const record = {
      member_id,
      name,
      gender: typeof body.gender === 'string' && body.gender ? body.gender : null,
      wing_flat: typeof body.wing_flat === 'string' && body.wing_flat ? body.wing_flat : null,
      phone: typeof body.phone === 'string' ? body.phone : null,
      whatsapp: typeof body.whatsapp === 'string' && body.whatsapp ? body.whatsapp : null,
      photo_url: typeof body.photo_url === 'string' && body.photo_url ? body.photo_url : null,
      email: typeof body.email === 'string' ? body.email : null,
      ownership: typeof body.ownership === 'string' && body.ownership ? body.ownership : null,
      preferred_timing: typeof body.preferred_timing === 'string' && body.preferred_timing ? body.preferred_timing : null,
      plan: typeof body.plan === 'string' ? body.plan : null,
      duration: typeof body.duration === 'string' ? body.duration : null,
      start_date: toDateOrNull(body.start_date),
      end_date: toDateOrNull(body.end_date),
      status: (typeof body.status === 'string' ? body.status : 'Active') as MemberDoc['status'],
      paid: typeof body.paid === 'number' ? body.paid : Number(body.paid) || 0,
      payment_type: typeof body.payment_type === 'string' && body.payment_type ? body.payment_type : null,
      remark: typeof body.remark === 'string' && body.remark ? body.remark : null,
      registered_on: toDateOrNull(body.registered_on),
      created_at: new Date(),
    };

    const result = await members.insertOne(record as unknown as MemberDoc);
    const inserted = await members.findOne({ _id: result.insertedId });
    if (!inserted) return res.status(500).json({ error: 'Failed to load created member' });

    return res.status(201).json({ member: serializeMember(inserted) });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
