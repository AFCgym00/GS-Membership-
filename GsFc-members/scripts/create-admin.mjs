// Creates (or updates) an admin login in the `users` collection.
//
// Usage:
//   MONGODB_URI="mongodb+srv://..." node scripts/create-admin.mjs you@afcgym.com 'yourPassword123'

import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'afc_gym';
const [, , emailArg, passwordArg] = process.argv;

if (!uri) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}
if (!emailArg || !passwordArg) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });

    const email = emailArg.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(passwordArg, 10);

    await users.updateOne(
      { email },
      { $set: { email, passwordHash, role: 'admin' } },
      { upsert: true }
    );

    console.log(`Admin user ready: ${email}`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
