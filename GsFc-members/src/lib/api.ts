export interface Member {
  id: string;
  member_id: string | null;
  name: string;
  gender: string | null;
  wing_flat: string | null;
  phone: string | null;
  whatsapp: string | null;
  photo_url: string | null;
  email: string | null;
  ownership: string | null;
  preferred_timing: string | null;
  plan: string | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  paid: number;
  payment_type: string | null;
  remark: string | null;
  registered_on: string | null;
  created_at: string;
}

export type NewMember = Pick<Member, 'name'> &
  Partial<Omit<Member, 'id' | 'created_at' | 'name'>>;

export interface PlanPricingTier {
  duration: string;
  price: number;
  members: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  popular: boolean;
  sort_order: number;
  pricing: PlanPricingTier[];
  totalMembers: number;
  revenue: number;
}

export interface RevenueMonthPoint {
  month: string;
  revenue: number;
  newMembers: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  growthPercent: number;
  avgPerMember: number;
  newSignupsRevenue: number;
  totalMembers: number;
  activeMembers: number;
  monthlyData: RevenueMonthPoint[];
  planBreakdown: { name: string; value: number }[];
  recentTransactions: {
    member: string;
    plan: string | null;
    duration: string | null;
    amount: number;
    date: string | null;
  }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  // credentials: 'include' sends the httpOnly session cookie set by
  // /api/auth/login — there's no bearer token to attach manually.
  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — keep the default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  members: {
    list: () => request<{ members: Member[] }>('/members'),
    create: (member: NewMember) =>
      request<{ member: Member }>('/members', {
        method: 'POST',
        body: JSON.stringify(member),
      }),
    update: (id: string, updates: Partial<Member>) =>
      request<{ member: Member }>(`/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    remove: (id: string) => request<void>(`/members/${id}`, { method: 'DELETE' }),
  },
  plans: {
    list: () => request<{ plans: Plan[] }>('/plans'),
  },
  revenue: {
    summary: () => request<RevenueSummary>('/revenue/summary'),
  },
};
