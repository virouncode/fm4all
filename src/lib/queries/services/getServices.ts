// "use cache";
import { servicesMapping } from "@/constants/services";
import { db } from "@/db";
import { services, servicesFournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { eq, getTableColumns } from "drizzle-orm";

export const getServicesForFournisseur = async (fournisseurId: number) => {
  // cacheTag(getFournisseurTag("services", fournisseurId));
  // console.log(`🔍 DB REQUEST: getServicesForFournisseur(${fournisseurId})`);
  try {
    const results = await db
      .select({
        ...getTableColumns(services),
      })
      .from(services)
      .innerJoin(
        servicesFournisseurs,
        eq(servicesFournisseurs.serviceId, services.id),
      )
      .where(eq(servicesFournisseurs.fournisseurId, fournisseurId))
      .orderBy(servicesFournisseurs.serviceId);
    if (results.length === 0) return [];
    return results.map((result) => ({
      ...result,
      titre:
        servicesMapping.find((service) => service.nom === result.nom)?.titre ||
        "Service inconnu",
      icons:
        servicesMapping.find((service) => service.nom === result.nom)?.icons ||
        [],
    }));
  } catch (err) {
    errorHelper(err);
  }
};
