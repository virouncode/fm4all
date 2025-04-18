import { db } from "@/db";
import { services, servicesFournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { eq, getTableColumns } from "drizzle-orm";

export const getAllServices = async () => {
  try {
    const results = await db.select().from(services);
    if (results.length === 0) return [];
    return results;
  } catch (err) {
    errorHelper(err);
  }
};

export const getServicesForFournisseur = async (fournisseurId: number) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(services),
      })
      .from(services)
      .innerJoin(
        servicesFournisseurs,
        eq(servicesFournisseurs.serviceId, services.id)
      )
      .where(eq(servicesFournisseurs.fournisseurId, fournisseurId))
      .orderBy(servicesFournisseurs.serviceId);
    if (results.length === 0) return [];
    return results;
  } catch (err) {
    errorHelper(err);
  }
};
