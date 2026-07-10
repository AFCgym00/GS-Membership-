import {
  Users,
  TrendingUp,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useRevenue } from '@/hooks/use-revenue';
import { useMembers } from '@/hooks/use-members';

// No check-in/attendance table exists yet in the schema, so this chart stays
// as sample data. Add an `attendance` table + API endpoint to make it real.
const attendanceData = [
  { day: 'Mon', members: 85 },
  { day: 'Tue', members: 72 },
  { day: 'Wed', members: 91 },
  { day: 'Thu', members: 68 },
  { day: 'Fri', members: 95 },
  { day: 'Sat', members: 110 },
  { day: 'Sun', members: 55 },
];

const tooltipStyle = {
  backgroundColor: 'hsl(0, 0%, 8%)',
  border: '1px solid hsl(0, 0%, 20%)',
  borderRadius: '8px',
  color: 'hsl(0, 0%, 98%)',
};

export default function DashboardOverview() {
  const { summary, loading: revenueLoading, error: revenueError } = useRevenue();
  const { members, loading: membersLoading } = useMembers();

  const loading = revenueLoading || membersLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (revenueError || !summary) {
    return (
      <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
        {revenueError ?? 'Failed to load dashboard data'}
      </div>
    );
  }

  const isGrowthPositive = summary.growthPercent >= 0;
  const thisMonthLabel = summary.monthlyData.at(-1)?.month ?? '—';
  const newSignupsThisMonth = summary.monthlyData.at(-1)?.newMembers ?? 0;

  const stats = [
    {
      title: 'Total Members',
      value: String(summary.totalMembers),
      change: null,
      icon: Users,
      description: `${summary.activeMembers} active`,
    },
    {
      title: 'Revenue This Month',
      value: `₹${summary.currentMonthRevenue.toLocaleString('en-IN')}`,
      change: `${isGrowthPositive ? '+' : ''}${summary.growthPercent}%`,
      trend: isGrowthPositive ? 'up' : 'down',
      icon: TrendingUp,
      description: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: `₹${(summary.totalRevenue / 100000).toFixed(1)}L`,
      change: null,
      icon: CreditCard,
      description: 'all time',
    },
    {
      title: 'New Sign-ups',
      value: String(newSignupsThisMonth),
      change: null,
      icon: UserPlus,
      description: thisMonthLabel,
    },
  ];

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const planTotals = new Map<string, number>();
  for (const m of members) {
    if (!m.plan) continue;
    planTotals.set(m.plan, (planTotals.get(m.plan) ?? 0) + 1);
  }
  const planDistribution = Array.from(planTotals.entries()).map(([name, count], i) => ({
    name,
    members: count,
    percentage: members.length ? Math.round((count / members.length) * 100) : 0,
    color: i === 0 ? 'bg-orange-500' : 'bg-orange-300',
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {stat.change && (
                  stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )
                )}
                {stat.change && (
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                )}
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue, most recent months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {summary.monthlyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.monthlyData.slice(-6)}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                    <XAxis dataKey="month" stroke="hsl(0, 0%, 64%)" fontSize={12} />
                    <YAxis
                      stroke="hsl(0, 0%, 64%)"
                      fontSize={12}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(24, 95%, 53%)"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Attendance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Sample data — no check-in tracking yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="day" stroke="hsl(0, 0%, 64%)" fontSize={12} />
                  <YAxis stroke="hsl(0, 0%, 64%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'Members']} />
                  <Bar dataKey="members" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Recent Members */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recently Added Members</CardTitle>
            <CardDescription>Latest member records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.plan}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{member.duration}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        {member.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Members by plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((plan) => (
              <div key={plan.name}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-muted-foreground">{plan.members} ({plan.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${plan.color}`} style={{ width: `${plan.percentage}%` }} />
                </div>
              </div>
            ))}
            {planDistribution.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No members yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
