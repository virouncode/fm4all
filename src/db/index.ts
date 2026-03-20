import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

const connectionString = env.DATABASE_URL;

// Singleton global pour éviter de recréer un Pool en dev / sur Vercel
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
  });

if (!globalForDb.pool) globalForDb.pool = pool;

export const db = globalForDb.db ?? drizzle({ client: pool, schema });
if (!globalForDb.db) globalForDb.db = db;
