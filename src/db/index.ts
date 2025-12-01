// src/db/index.ts
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema"; // adapte le chemin si ton index de schémas est ailleurs

// Next.js charge déjà .env.local au runtime, pas besoin de dotenv ici

const connectionString = process.env.DATABASE_URL!;

// Singleton global pour éviter de recréer un Pool en dev / sur Vercel
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

if (!globalForDb.pool) {
  globalForDb.pool = new Pool({
    connectionString,
  });
}

export const db =
  globalForDb.db ?? drizzle({ client: globalForDb.pool, schema });

if (!globalForDb.db) {
  globalForDb.db = db;
}
