import { seedFm4all } from "@/db/seed/fm4all";

async function main() {
  await seedFm4all();
}

main()
  .then(() => {
    console.log("✅ Seed terminé");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed échoué", err);
    process.exit(1);
  });
