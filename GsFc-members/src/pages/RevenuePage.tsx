import { TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useRevenue } from '@/hooks/use-revenue';

const tooltipStyle = {
  backgroundColor: 'hsl(0, 0%, 8%)',
  border: '1px solid hsl(0, 0%, 20%)',
  borderRadius: '8px',
  color: 'hsl(0, 0%, 98%)',
};

const PIE_COLORS = ['hsl(24, 95%, 63%)', 'hsl(24, 95%, 43%)', 'hsl(24, 95%, 30%)', 'hsl(24, 60%, 75%)'];

export default function RevenuePage() {
  const { summary, loading, error } = useRevenue();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading revenue data…
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
        {error ?? 'Failed to load revenue data'}
      </div>
    );
  }

  const {
    totalRevenue,
    currentMonthRevenue,
    growthPercent,
    avgPerMember,
    newSignupsRevenue,
    monthlyData,
    planBreakdown,
    recentTransactions,
  } = summary;

  const planBreakdownTotal = planBreakdown.reduce((sum, p) => sum + p.value, 0);
  const isGrowthPositive = growthPercent >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{(currentMonthRevenue / 1000).toFixed(0)}k</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {isGrowthPositive ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={isGrowthPositive ? 'text-green-500' : 'text-red-500'}>
                {isGrowthPositive ? '+' : ''}{growthPercent}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Per Active Member</p>
                <p className="text-2xl font-bold">₹{avgPerMember.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Sign-ups This Month</p>
                <p className="text-2xl font-bold">₹{newSignupsRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Revenue Trend</TabsTrigger>
          <TabsTrigger value="members">New Members</TabsTrigger>
          <TabsTrigger value="breakdown">Plan Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue by month, based on member start dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No revenue data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis dataKey="month" stroke="hsl(0, 0%, 64%)" fontSize={12} />
                      <YAxis stroke="hsl(0, 0%, 64%)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 53%)" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>New Member Sign-ups</CardTitle>
              <CardDescription>Monthly new member registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No member data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis dataKey="month" stroke="hsl(0, 0%, 64%)" fontSize={12} />
                      <YAxis stroke="hsl(0, 0%, 64%)" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'New Members']} />
                      <Bar dataKey="newMembers" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>Total revenue split by plan type</CardDescription>
            </CardHeader>
            <CardContent>
              {planBreakdown.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No revenue data yet.</div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-[300px] w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planBreakdown.map((entry, index) => (
                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4 flex-1">
                    {planBreakdown.map((plan, index) => (
                      <div key={plan.name} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{plan.value.toLocaleString('en-IN')} ({planBreakdownTotal ? ((plan.value / planBreakdownTotal) * 100).toFixed(0) : 0}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{tx.member}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.plan}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{tx.duration}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="text-right text-sm font-medium text-green-500">+₹{tx.amount.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
              {recentTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
