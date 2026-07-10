import { Check, Users, TrendingUp, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { usePlans } from '@/hooks/use-plans';

export default function PlansPage() {
  const { plans, loading, error } = usePlans();

  const totalRevenue = plans.reduce((sum, p) => sum + p.revenue, 0);
  const totalMembers = plans.reduce((sum, p) => sum + p.totalMembers, 0);
  const mostPopular = plans.find((p) => p.popular)?.name ?? '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Popular</p>
                <p className="text-lg font-bold">{mostPopular}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.popular ? 'border-primary/50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.popular && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">Most Popular</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium mb-3">Included Features</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Pricing Tiers */}
              <div>
                <h4 className="text-sm font-medium mb-3">Pricing & Members by Duration</h4>
                <div className="space-y-3">
                  {plan.pricing.map((tier) => (
                    <div key={tier.duration} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{tier.duration}</span>
                          <span className="text-sm text-muted-foreground">{tier.members} members</span>
                        </div>
                        <Progress
                          value={plan.totalMembers ? (tier.members / plan.totalMembers) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-sm font-bold w-20 text-right">₹{tier.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Plan Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Members</p>
                  <p className="text-xl font-bold">{plan.totalMembers}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold">₹{(plan.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
