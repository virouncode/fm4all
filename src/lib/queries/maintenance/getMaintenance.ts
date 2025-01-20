import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  maintenanceQuantites,
  maintenanceTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectMaintenanceQuantitesSchema } from "@/zod-schemas/maintenanceQuantites";
import { selectMaintenanceTarifsSchema } from "@/zod-schemas/maintenanceTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getMaintenanceQuantites = async (surface: string) => {
  try {
    const results = await db
      .select()
      .from(maintenanceQuantites)
      .where(eq(maintenanceQuantites.surface, parseInt(surface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectMaintenanceQuantitesSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      freqAnnuelle: result.freqAnnuelle / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getMaintenanceTarifs = async (surface: string) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(maintenanceTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(maintenanceTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, maintenanceTarifs.fournisseurId)
      )
      .where(eq(maintenanceTarifs.surface, parseInt(surface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectMaintenanceTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
