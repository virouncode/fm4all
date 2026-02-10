import { db } from "@/db/index.node";
import { user } from "@/db/schema/auth";
import { entrepriseRoles, entreprises } from "@/db/schema/entreprises";
import { auth } from "@/server/auth/auth.node";
import { and, eq } from "drizzle-orm";
import { userAdhesions } from "../schema";

export async function seedFm4all() {
  console.log("🌱 Seeding fm4all...");

  // ---------------------------------------------------------------------------
  // 1️⃣ Entreprises
  // ---------------------------------------------------------------------------
  const siret = "94192864000015"; // SIRET de fm4all (exemple)
  const existingFm4allEntreprise = await db
    .select()
    .from(entreprises)
    .where(eq(entreprises.siret, siret))
    .limit(1);

  const fm4allEntreprise =
    existingFm4allEntreprise[0] ??
    (
      await db
        .insert(entreprises)
        .values({
          nom: "fm4all",
          siret,
          prenomContact: "Romuald",
          nomContact: "Buffe",
          emailContact: "contact@fm4all.com",
          phoneContact: "+33669311046",
        })
        .returning()
    )[0];

  const siret2 = "12345678900000"; // SIRET d'une entreprise fictive pour tester les rôles
  const existingTestEntreprise = await db
    .select()
    .from(entreprises)
    .where(eq(entreprises.siret, siret2))
    .limit(1);

  const testEntreprise =
    existingTestEntreprise[0] ??
    (
      await db
        .insert(entreprises)
        .values({
          nom: "ENTREPRISE TEST",
          siret: siret2,
          prenomContact: "Alice",
          nomContact: "Dubois",
          emailContact: "contact@entreprise-test.com",
          phoneContact: "+33612345678",
        })
        .returning()
    )[0];

  // ---------------------------------------------------------------------------
  // 2️⃣ Utilisateur admin
  // ---------------------------------------------------------------------------
  const adminFm4allEmail = "viroun@fm4all.com";

  const existingFm4allUser = await db
    .select()
    .from(user)
    .where(eq(user.email, adminFm4allEmail))
    .limit(1);

  const fm4allUser =
    existingFm4allUser[0] ??
    (await auth.api.signUpEmail({
      body: {
        name: "Viroun Kattygnarath",
        prenom: "Viroun",
        nom: "Kattygnarath",
        phone: "+33683267962",
        email: adminFm4allEmail,
        password: "Admin@123", // N'oubliez pas de changer ce mot de passe après la première connexion
      },
    }));

  const adminTestEmail = "alice.dubois@entreprise-test.com";

  const existingTestUser = await db
    .select()
    .from(user)
    .where(eq(user.email, adminTestEmail))
    .limit(1);

  const testUser =
    existingTestUser[0] ??
    (await auth.api.signUpEmail({
      body: {
        name: "Alice Dubois",
        prenom: "Alice",
        nom: "Dubois",
        phone: "+33612345678",
        email: adminTestEmail,
        password: "Test@123",
      },
    }));

  // ---------------------------------------------------------------------------
  // 3️⃣ Adhésion utilisateur
  // ---------------------------------------------------------------------------
  const existingAdhesion = await db
    .select()
    .from(userAdhesions)
    .where(eq(userAdhesions.userId, fm4allUser.id))
    .limit(1);

  if (!existingAdhesion.length) {
    await db.insert(userAdhesions).values({
      userId: fm4allUser.id,
      entrepriseId: fm4allEntreprise.id,
      role: "super_admin",
      statut: "actif",
    });
  }

  const existingTestAdhesion = await db
    .select()
    .from(userAdhesions)
    .where(eq(userAdhesions.userId, testUser.id))
    .limit(1);
  console.log("testUser", testUser);

  if (!existingTestAdhesion.length) {
    await db.insert(userAdhesions).values({
      userId: testUser.id,
      entrepriseId: testEntreprise.id,
      role: "admin",
      statut: "actif",
    });
  }

  // ---------------------------------------------------------------------------
  // 4️⃣ Rôle entreprise
  // ---------------------------------------------------------------------------
  const roleFm4all1 = "plateforme";
  const existingPlateformeRole = await db
    .select()
    .from(entrepriseRoles)
    .where(
      and(
        eq(entrepriseRoles.entrepriseId, fm4allEntreprise.id),
        eq(entrepriseRoles.role, roleFm4all1),
      ),
    )
    .limit(1);

  if (!existingPlateformeRole.length) {
    await db.insert(entrepriseRoles).values({
      entrepriseId: fm4allEntreprise.id,
      role: roleFm4all1,
    });
  }

  const roleFm4all2 = "prestataire";
  const existingPrestataireRole = await db
    .select()
    .from(entrepriseRoles)
    .where(
      and(
        eq(entrepriseRoles.entrepriseId, fm4allEntreprise.id),
        eq(entrepriseRoles.role, roleFm4all2),
      ),
    )
    .limit(1);

  if (!existingPrestataireRole.length) {
    await db.insert(entrepriseRoles).values({
      entrepriseId: fm4allEntreprise.id,
      role: roleFm4all2,
    });
  }

  const roleTest = "client";
  const existingTestRole = await db
    .select()
    .from(entrepriseRoles)
    .where(
      and(
        eq(entrepriseRoles.entrepriseId, testEntreprise.id),
        eq(entrepriseRoles.role, roleTest),
      ),
    )
    .limit(1);

  if (!existingTestRole.length) {
    await db.insert(entrepriseRoles).values({
      entrepriseId: testEntreprise.id,
      role: roleTest,
    });
  }

  console.log("✅ fm4all seeded");
}
