import { MongoClient, ServerApiVersion, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'afc_gym';

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

// Vercel serverless functions can be invoked many times against warm
// containers. Caching the client (and the connect() promise) on the global
// object avoids opening a new MongoDB connection on every invocation, which
// would otherwise quickly exhaust Atlas's connection limit.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());

export async function getDb(): Promise<Db> {
  const connected = await clientPromise;
  return connected.db(dbName);
}
