import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  legioTarifs,
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarifs,
  qualiteAirTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { roundSurface } from "@/lib/roundSurface";
import { selectLegioTarifsSchema } from "@/zod-schemas/legioTarifs";
import { selectMaintenanceQuantitesSchema } from "@/zod-schemas/maintenanceQuantites";
import { selectMaintenanceTarifsSchema } from "@/zod-schemas/maintenanceTarifs";
import { selectQ18TarifsSchema } from "@/zod-schemas/q18Tarifs";
import { selectQualiteAirTarifsSchema } from "@/zod-schemas/qualiteAirTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getMaintenanceQuantites = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(maintenanceQuantites)
      .where(eq(maintenanceQuantites.surface, roundedSurface));
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
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(maintenanceTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
      })
      .from(maintenanceTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, maintenanceTarifs.fournisseurId)
      )
      .where(eq(maintenanceTarifs.surface, roundedSurface));
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

export const getQ18Tarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(q18Tarifs)
      .where(eq(q18Tarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQ18TarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getLegioTarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(legioTarifs)
      .where(eq(legioTarifs.surface, roundedSurface));
    if (results.length === 0) return [];

    const validatedResults = results.map((result) =>
      selectLegioTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getQualiteAirTarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(qualiteAirTarifs)
      .where(eq(qualiteAirTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQualiteAirTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
