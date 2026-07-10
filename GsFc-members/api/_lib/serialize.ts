import type { ObjectId } from 'mongodb';

/** Converts a Date (or null/undefined) to an ISO date string, or null. */
function toISO(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

export interface MemberDoc {
  _id: ObjectId;
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
  start_date: Date | null;
  end_date: Date | null;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  paid: number;
  payment_type: string | null;
  remark: string | null;
  registered_on: Date | null;
  created_at: Date;
}

export function serializeMember(doc: MemberDoc) {
  return {
    id: doc._id.toString(),
    member_id: doc.member_id ?? null,
    name: doc.name,
    gender: doc.gender ?? null,
    wing_flat: doc.wing_flat ?? null,
    phone: doc.phone ?? null,
    whatsapp: doc.whatsapp ?? null,
    photo_url: doc.photo_url ?? null,
    email: doc.email ?? null,
    ownership: doc.ownership ?? null,
    preferred_timing: doc.preferred_timing ?? null,
    plan: doc.plan ?? null,
    duration: doc.duration ?? null,
    start_date: toISO(doc.start_date),
    end_date: toISO(doc.end_date),
    status: doc.status,
    paid: Number(doc.paid ?? 0),
    payment_type: doc.payment_type ?? null,
    remark: doc.remark ?? null,
    registered_on: toISO(doc.registered_on),
    created_at: toISO(doc.created_at),
  };
}

export interface PlanPricingTier {
  duration: string;
  price: number;
}

export interface PlanDoc {
  _id: ObjectId;
  name: string;
  description: string | null;
  features: string[];
  popular: boolean;
  sort_order: number;
  pricing: PlanPricingTier[];
  created_at: Date;
}

export function serializePlan(doc: PlanDoc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? null,
    features: doc.features ?? [],
    popular: Boolean(doc.popular),
    sort_order: doc.sort_order ?? 0,
    pricing: doc.pricing ?? [],
    created_at: toISO(doc.created_at),
  };
}
