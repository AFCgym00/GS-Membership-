import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/mongodb.js';
import { requireAdmin } from '../_lib/auth.js';
import { serializeMember, type MemberDoc } from '../_lib/serialize.js';

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short' });
}

function sortKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = await getDb();
  const docs = await db.collection<MemberDoc>('members').find().toArray();
  const members = docs.map(serializeMember);

  // Monthly trend, chronological, most recent 12 months that have data
  const byMonth = new Map<string, { month: string; revenue: number; newMembers: number }>();
  for (const m of members) {
    if (!m.start_date) continue;
    const key = sortKey(m.start_date);
    const entry = byMonth.get(key) ?? { month: monthLabel(m.start_date), revenue: 0, newMembers: 0 };
    entry.revenue += Number(m.paid ?? 0);
    entry.newMembers += 1;
    byMonth.set(key, entry);
  }
  const monthlyData = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, v]) => v);

  const totalRevenue = members.reduce((sum, m) => sum + Number(m.paid ?? 0), 0);
  const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue ?? 0;
  const lastMonthRevenue = monthlyData[monthlyData.length - 2]?.revenue ?? 0;
  const growthPercent = lastMonthRevenue
    ? Number((((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
    : 0;

  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const avgPerMember = activeMembers ? Math.round(currentMonthRevenue / activeMembers) : 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newSignupsRevenue = members
    .filter((m) => m.start_date && new Date(m.start_date) >= startOfMonth)
    .reduce((sum, m) => sum + Number(m.paid ?? 0), 0);

  const planTotals = new Map<string, number>();
  for (const m of members) {
    if (!m.plan) continue;
    planTotals.set(m.plan, (planTotals.get(m.plan) ?? 0) + Number(m.paid ?? 0));
  }
  const planBreakdown = Array.from(planTotals.entries()).map(([name, value]) => ({ name, value }));

  const recentTransactions = [...members]
    .sort((a, b) => {
      const aDate = a.start_date ?? a.created_at ?? '';
      const bDate = b.start_date ?? b.created_at ?? '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, 10)
    .map((m) => ({
      member: m.name,
      plan: m.plan,
      duration: m.duration,
      amount: Number(m.paid ?? 0),
      date: m.start_date,
    }));

  return res.status(200).json({
    totalRevenue,
    currentMonthRevenue,
    lastMonthRevenue,
    growthPercent,
    avgPerMember,
    newSignupsRevenue,
    totalMembers: members.length,
    activeMembers,
    monthlyData,
    planBreakdown,
    recentTransactions,
  });
}
