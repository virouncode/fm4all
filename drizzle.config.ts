// Lecture seule — les migrations sont gérées dans le projet portail.
// Ce fichier est conservé uniquement pour drizzle-kit studio.
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
