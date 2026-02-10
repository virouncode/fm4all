import { db } from "@/db";
import { entrepriseRoles, entreprises, userAdhesions } from "@/db/schema";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
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
  const [bootstrapData] = await db
    .select({
      entreprise: getTableColumns(entreprises),
      roleAdhesion: userAdhesions.role,
    })
    .from(userAdhesions)
    .innerJoin(entreprises, eq(userAdhesions.entrepriseId, entreprises.id))
    .where(
      and(eq(userAdhesions.userId, userId), eq(userAdhesions.statut, "actif")),
    )
    .limit(1);
  if (!bootstrapData || !bootstrapData.entreprise) {
    return null;
  }

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
    roleAdhesion: bootstrapData.roleAdhesion,
    rolesEntreprise: roles,
    postureActive,
  };
}
