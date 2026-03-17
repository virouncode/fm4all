import { servicesMapping } from "@/constants/services";
import { db } from "@/db";
import { services, servicesFournisseurs } from "@/db/schema";
import { getFournisseurTag } from "@/lib/data-cache";
import { errorHelper } from "@/lib/errorHelper";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getAllServices = async () => {
  try {
    const results = await db.select().from(services).orderBy(services.id);
    return results.map((result) => ({
      ...result,
      titre:
        servicesMapping.find((service) => service.nom === result.nom)?.titre ||
        result.nom,
    }));
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getServicesForFournisseur = async (fournisseurId: number) => {
  "use cache";
  cacheTag(getFournisseurTag("services", fournisseurId));
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
