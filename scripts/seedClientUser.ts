// scripts/seedClientUser.ts
import dotenv from "dotenv";

// Charge .env.local AVANT tout le reste
dotenv.config({ path: ".env.local" });

console.log("DATABASE_URL (bootstrap) =", process.env.DATABASE_URL);

async function main() {
  const { runSeedClientUser } = await import("./seedClientUserImpl");
  await runSeedClientUser();
}

main()
  .then(() => {
    console.log("Seed terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erreur lors du seed user :", err);
    process.exit(1);
  });
