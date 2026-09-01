import "server-only";
import { RATIO } from "@/constants/constants";

import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entrepriseRoles,
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
import { and, eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const imageDoc = alias(documents, "image_doc");

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
  } catch (error) {
    console.error("[queries] getMaintenanceQuantites a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(maintenanceTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, maintenanceTarifs.entrepriseId),
      )
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, entreprises.id),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .leftJoin(imageDoc, eq(imageDoc.id, maintenanceTarifs.imageId))
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
  } catch (error) {
    console.error("[queries] getMaintenanceTarifs a échoué", error);
    return [];
  }
};

export const getQ18Tarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("q18Tarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({ ...getTableColumns(q18Tarifs) })
      .from(q18Tarifs)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, q18Tarifs.entrepriseId),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .where(eq(q18Tarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQ18TarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (error) {
    console.error("[queries] getQ18Tarifs a échoué", error);
    return [];
  }
};

export const getLegioTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("legioTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({ ...getTableColumns(legioTarifs) })
      .from(legioTarifs)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, legioTarifs.entrepriseId),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .where(eq(legioTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectLegioTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (error) {
    console.error("[queries] getLegioTarifs a échoué", error);
    return [];
  }
};

export const getQualiteAirTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("qualiteAirTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({ ...getTableColumns(qualiteAirTarifs) })
      .from(qualiteAirTarifs)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, qualiteAirTarifs.entrepriseId),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .where(eq(qualiteAirTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectQualiteAirTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixAnnuel: result.prixAnnuel / RATIO,
    }));
  } catch (error) {
    console.error("[queries] getQualiteAirTarifs a échoué", error);
    return [];
  }
};
