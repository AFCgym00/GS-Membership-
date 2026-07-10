import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/mongodb.js';
import { requireAdmin } from '../_lib/auth.js';
import { serializePlan, type PlanDoc, type PlanPricingTier } from '../_lib/serialize.js';
import type { MemberDoc } from '../_lib/serialize.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = await getDb();

  const [planDocs, memberDocs] = await Promise.all([
    db.collection<PlanDoc>('plans').find().sort({ sort_order: 1 }).toArray(),
    db
      .collection<MemberDoc>('members')
      .find({}, { projection: { plan: 1, duration: 1, paid: 1 } })
      .toArray(),
  ]);

  const enrichedPlans = planDocs.map((plan) => {
    const membersOnPlan = memberDocs.filter((m) => m.plan === plan.name);
    const totalMembers = membersOnPlan.length;
    const revenue = membersOnPlan.reduce((sum, m) => sum + Number(m.paid ?? 0), 0);

    const pricing = (plan.pricing ?? []).map((tier: PlanPricingTier) => ({
      ...tier,
      members: membersOnPlan.filter((m) => m.duration === tier.duration).length,
    }));

    return { ...serializePlan(plan), totalMembers, revenue, pricing };
  });

  return res.status(200).json({ plans: enrichedPlans });
}
