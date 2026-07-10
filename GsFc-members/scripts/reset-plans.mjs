// Clean reseed script for the AFC Gym 'plans' collection.
// Wipes any existing plans (old names included) and inserts the current
// Regular Plan / Semi Advance Plan / Personal Training lineup fresh.
// Members are only seeded if the members collection is empty.
//
// Usage:
//   MONGODB_URI="mongodb+srv://..." node scripts/reset-plans.mjs
// Safe to re-run: plans are always wiped and reinserted; members are only
// seeded once (skipped if the members collection already has data).

import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'afc_gym';

if (!uri) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const members = [
  { name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', plan: 'Semi Advance Plan', duration: '6 Months', start_date: '2025-10-01', end_date: '2026-04-01', status: 'Active', paid: 7000 },
  { name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', plan: 'Regular Plan', duration: '3 Months', start_date: '2026-01-15', end_date: '2026-04-15', status: 'Expiring Soon', paid: 2800 },
  { name: 'Amit Singh', phone: '+91 76543 21098', email: 'amit@email.com', plan: 'Semi Advance Plan', duration: '12 Months', start_date: '2025-06-01', end_date: '2026-06-01', status: 'Active', paid: 12000 },
  { name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', plan: 'Regular Plan', duration: '1 Month', start_date: '2026-03-01', end_date: '2026-04-01', status: 'Expiring Soon', paid: 1200 },
  { name: 'Vikram Desai', phone: '+91 54321 09876', email: 'vikram@email.com', plan: 'Semi Advance Plan', duration: '6 Months', start_date: '2025-12-01', end_date: '2026-06-01', status: 'Active', paid: 7000 },
  { name: 'Anjali Nair', phone: '+91 43210 98765', email: 'anjali@email.com', plan: 'Regular Plan', duration: '3 Months', start_date: '2025-11-01', end_date: '2026-02-01', status: 'Expired', paid: 2800 },
  { name: 'Rohit Kumar', phone: '+91 32109 87654', email: 'rohit@email.com', plan: 'Semi Advance Plan', duration: '12 Months', start_date: '2025-04-01', end_date: '2026-04-01', status: 'Expiring Soon', paid: 12000 },
  { name: 'Kavita Joshi', phone: '+91 21098 76543', email: 'kavita@email.com', plan: 'Regular Plan', duration: '6 Months', start_date: '2025-10-15', end_date: '2026-04-15', status: 'Active', paid: 5000 },
  { name: 'Suresh Menon', phone: '+91 10987 65432', email: 'suresh@email.com', plan: 'Semi Advance Plan', duration: '3 Months', start_date: '2026-01-01', end_date: '2026-04-01', status: 'Expiring Soon', paid: 4000 },
  { name: 'Deepa Iyer', phone: '+91 98712 34567', email: 'deepa@email.com', plan: 'Regular Plan', duration: '12 Months', start_date: '2025-08-01', end_date: '2026-08-01', status: 'Active', paid: 9000 },
  { name: 'Arjun Malhotra', phone: '+91 87612 34567', email: 'arjun@email.com', plan: 'Semi Advance Plan', duration: '6 Months', start_date: '2026-01-10', end_date: '2026-07-10', status: 'Active', paid: 7000 },
  { name: 'Meera Kulkarni', phone: '+91 76512 34567', email: 'meera@email.com', plan: 'Regular Plan', duration: '1 Month', start_date: '2026-02-20', end_date: '2026-03-20', status: 'Expired', paid: 1200 },
].map((m) => ({
  ...m,
  start_date: new Date(m.start_date),
  end_date: new Date(m.end_date),
  created_at: new Date(),
}));

const plans = [
  {
    name: 'Regular Plan',
    description: 'Perfect for beginners and members who prefer self-training',
    features: [
      'Self-training access',
      'Full gym equipment access',
      'Basic general fitness guidance',
      'New joining support by trainers for the first 3 days',
      'Clean and safe workout environment',
      'Locker facility (if available)',
      'Flexible workout timings',
      'Suitable for strength & fitness training',
    ],
    popular: false,
    sort_order: 1,
    pricing: [
      { duration: '1 Month', price: 600 },
      { duration: '3 Months', price: 1600 },
      { duration: '6 Months', price: 3200 },
      { duration: '12 Months', price: 5800 },
    ],
    created_at: new Date(),
  },
  {
    name: 'Semi Advance Plan',
    description: 'Perfect for members who want faster results with professional guidance',
    features: [
      'Everything in the Regular Plan',
      'Full App Access',
      'Professional workout routine',
      '1-Time Customized Diet Plan',
      'Goal-based workout (Fat Loss / Muscle Gain / Transformation)',
      'Workout Tracker',
      'Calories Tracker',
      'Protein, Carbs & Fiber Tracker',
      'Water Intake Tracker',
      'Attendance Tracker',
      'Daily Steps Tracker',
      'Progress Tracking',
      'Exercise History',
      'Motivation & Progress Monitoring',
    ],
    popular: true,
    sort_order: 2,
    pricing: [
      { duration: '1 Month', price: 1000 },
      { duration: '3 Months', price: 2500 },
      { duration: '6 Months', price: 4200 },
      { duration: '12 Months', price: 8000 },
    ],
    created_at: new Date(),
  },
  {
    name: 'Personal Training',
    description: 'Additional service — 12 sessions/month (alternate days) with a dedicated one-to-one trainer',
    features: [
      'One-to-one personal trainer',
      'Customized workout program',
      'Body assessment before starting',
      'Training according to your body strength and fitness level',
      'Correct exercise form & technique',
      'Progressive overload planning for continuous improvement',
      'Recovery management to prevent injuries',
      'Regular progress tracking',
      'Fat loss & muscle gain guidance',
      'Personalized motivation and accountability',
      'Exercise modifications for injuries or limitations',
      'Performance monitoring',
      'Direct trainer support during every session',
    ],
    popular: false,
    sort_order: 3,
    pricing: [{ duration: '1 Month', price: 5000 }],
    created_at: new Date(),
  },
];

async function run() {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });

  try {
    await client.connect();
    const db = client.db(dbName);

    const membersCol = db.collection('members');
    const plansCol = db.collection('plans');

    if ((await membersCol.countDocuments()) === 0) {
      await membersCol.insertMany(members);
      console.log(`Inserted ${members.length} members.`);
    } else {
      console.log('members collection is not empty — skipped.');
    }

    const { deletedCount } = await plansCol.deleteMany({});
    console.log(`Cleared ${deletedCount} existing plan(s).`);

    await plansCol.insertMany(plans);
    console.log(`Inserted ${plans.length} fresh plans: ${plans.map((p) => p.name).join(', ')}.`);

    await plansCol.createIndex({ name: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    console.log('Done.');
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
