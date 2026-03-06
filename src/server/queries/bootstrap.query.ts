import "server-only";
import { db } from "@/db";
import {
  entrepriseRoles,
  entreprises,
  userClientAdhesions,
  userPlateformeAdhesions,
  userPrestataireAdhesions,
} from "@/db/schema";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { RolePrestataireAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import { and, eq, getTableColumns } from "drizzle-orm";

function pickDefaultPosture(roles: RoleEntrepriseType[]): RoleEntrepriseType {
  if (roles.includes("plateforme")) return "plateforme";
  if (roles.includes("client")) return "client";
  return "prestataire";
}

export async function bootstrapUser(
  userId: string,
  activePosture?: RoleEntrepriseType | undefined,
) {
  // 1. Essayer via user_client_adhesions (chemin standard client/prestataire)
  const [bootstrapData] = await db
    .select({
      entreprise: getTableColumns(entreprises),
      roleClientAdhesion: userClientAdhesions.role,
    })
    .from(userClientAdhesions)
    .innerJoin(
      entreprises,
      eq(userClientAdhesions.entrepriseId, entreprises.id),
    )
    .where(
      and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    )
    .limit(1);

  // 2. Toujours récupérer l'adhésion plateforme et prestataire
  const [platformAdhesion, prestataireAdhesion] = await Promise.all([
    db.query.userPlateformeAdhesions.findFirst({
      where: and(
        eq(userPlateformeAdhesions.userId, userId),
        eq(userPlateformeAdhesions.statut, "actif"),
      ),
    }),
    db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    }),
  ]);

  // 3. Si pas de client adhesion → fallback pour utilisateurs purement plateforme
  if (!bootstrapData || !bootstrapData.entreprise) {
    if (!platformAdhesion) return null;

    // Trouver l'entreprise FM4ALL (celle avec le rôle "plateforme")
    const [platformEntrepriseRole] = await db
      .select({ entrepriseId: entrepriseRoles.entrepriseId })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.role, "plateforme"))
      .limit(1);

    if (!platformEntrepriseRole) return null;

    const [fm4allEntreprise] = await db
      .select()
      .from(entreprises)
      .where(eq(entreprises.id, platformEntrepriseRole.entrepriseId))
      .limit(1);

    if (!fm4allEntreprise) return null;

    return {
      entreprise: fm4allEntreprise,
      roleClientAdhesion: null,
      rolePrestataireAdhesion: null,
      rolesEntreprise: ["plateforme"] as RoleEntrepriseType[],
      postureActive: "plateforme" as RoleEntrepriseType,
      rolePlateformeAdhesion: platformAdhesion.role as RolePlateformeAdhesionType,
    };
  }

  // 4. Chemin standard — récupérer les rôles entreprise
  const rolesEntreprise = await db
    .select()
    .from(entrepriseRoles)
    .where(eq(entrepriseRoles.entrepriseId, bootstrapData.entreprise.id));

  const roles = rolesEntreprise.map((r) => r.role);

  const postureActive =
    activePosture && roles.includes(activePosture)
      ? activePosture
      : pickDefaultPosture(roles);

  return {
    entreprise: bootstrapData.entreprise,
    roleClientAdhesion: bootstrapData.roleClientAdhesion,
    rolePrestataireAdhesion:
      (prestataireAdhesion?.role as RolePrestataireAdhesionType) ?? null,
    rolesEntreprise: roles,
    postureActive,
    rolePlateformeAdhesion:
      (platformAdhesion?.role as RolePlateformeAdhesionType) || null,
  };
}
