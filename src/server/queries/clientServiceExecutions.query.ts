import "server-only";

import { db } from "@/db";
import { clientServiceExecutions } from "@/db/schema/services";
import { clientServices } from "@/db/schema/services";
import { serviceEntreprises } from "@/db/schema/entreprises";
import { entreprises } from "@/db/schema/entreprises";
import { and, eq, or, isNull, gte } from "drizzle-orm";

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs)
 *
 * @param clientEntrepriseId - ID de l'entreprise cliente
 * @returns Liste des prestataires avec id et nom
 */
export async function getClientPrestataires(
  clientEntrepriseId: string
): Promise<Array<{ id: string; nom: string }>> {
  const results = await db
    .selectDistinct({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(clientServiceExecutions)
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId)
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId)
    )
    .innerJoin(
      entreprises,
      eq(entreprises.id, serviceEntreprises.entrepriseId)
    )
    .where(
      and(
        eq(clientServices.entrepriseId, clientEntrepriseId),
        eq(clientServices.statut, "actif"),
        eq(clientServiceExecutions.actif, true),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, new Date())
        )
      )
    )
    .orderBy(entreprises.nom);

  return results;
}
