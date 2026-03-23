import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entreprises,
  legioTarifs,
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarifs,
  qualiteAirTarifs,
} from "@/db/schema";
import { getSurfaceTag } from "@/lib/data-cache";
import { roundSurface } from "@/lib/utils/roundSurface";
import { selectLegioTarifsSchema } from "@/zod-schemas/legioTarifs.schema";
import { selectMaintenanceQuantitesSchema } from "@/zod-schemas/maintenanceQuantites.schema";
import { selectMaintenanceTarifsSchema } from "@/zod-schemas/maintenanceTarifs.schema";
import { selectQ18TarifsSchema } from "@/zod-schemas/q18Tarifs.schema";
import { selectQualiteAirTarifsSchema } from "@/zod-schemas/qualiteAirTarifs.schema";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getMaintenanceQuantites = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("maintenanceQuantites", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(maintenanceQuantites)
      .where(eq(maintenanceQuantites.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectMaintenanceQuantitesSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      freqAnnuelle: result.freqAnnuelle / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getMaintenanceTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("maintenanceTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(maintenanceTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
      })
      .from(maintenanceTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, maintenanceTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .where(eq(maintenanceTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectMaintenanceTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getQ18Tarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("q18Tarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(q18Tarifs)
      .where(eq(q18Tarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQ18TarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getLegioTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("legioTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(legioTarifs)
      .where(eq(legioTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectLegioTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getQualiteAirTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("qualiteAirTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(qualiteAirTarifs)
      .where(eq(qualiteAirTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQualiteAirTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
