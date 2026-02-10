import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("DATABASE_URL?", process.env.DATABASE_URL ? "OK" : "MISSING");

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DATABASE_URL");

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
export const dbPool = pool;
