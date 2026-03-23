import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  alarmesTarifs,
  colonnesSechesTarifs,
  documents,
  entrepriseInfos,
  entreprises,
  exutoiresParkingTarifs,
  exutoiresTarifs,
  incendieQuantites,
  incendieTarifs,
  portesCoupeFeuTarifs,
  riaTarifs,
} from "@/db/schema";
import { getGlobalTag, getSurfaceTag } from "@/lib/data-cache";
import { roundSurface } from "@/lib/utils/roundSurface";
import { selectAlarmesTarifsSchema } from "@/zod-schemas/alarmesTarifs.schema";
import { selectColonnesSechesTarifsSchema } from "@/zod-schemas/colonnesSechesTarifs.schema";
import { selectExutoiresTarifsSchema } from "@/zod-schemas/exutoiresTarifs.schema";
import { selectIncendieQuantitesSchema } from "@/zod-schemas/incendieQuantites.schema";
import { selectIncendieTarifsSchema } from "@/zod-schemas/incendieTarifs.schema";
import { selectPortesCoupeFeuTarifsSchema } from "@/zod-schemas/portesCoupeFeuTarifs.schema";
import { selectRiaTarifsSchema } from "@/zod-schemas/riaTarifs.schema";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getIncendieQuantite = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("incendieQuantites", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(incendieQuantites)
      .where(eq(incendieQuantites.surface, roundedSurface));
    if (results.length === 0) return null;
    return selectIncendieQuantitesSchema.parse(results[0]);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return null;
  }
};

export const getIncendieTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("incendieTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(incendieTarifs),
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
      .from(incendieTarifs)
      .innerJoin(entreprises, eq(entreprises.id, incendieTarifs.entrepriseId))
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .where(eq(incendieTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectIncendieTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParExtincteur: result.prixParExtincteur / RATIO,
      prixParBaes: result.prixParBaes / RATIO,
      prixParTelBaes: result.prixParTelBaes / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getExutoiresTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("exutoiresTarifs"));
  try {
    const results = await db.select().from(exutoiresTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectExutoiresTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParExutoire: result.prixParExutoire / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getExutoiresParkingsTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("exutoiresParkingTarifs"));
  try {
    const results = await db.select().from(exutoiresParkingTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectExutoiresTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParExutoire: result.prixParExutoire / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getAlarmesTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("alarmesTarifs"));
  try {
    const results = await db.select().from(alarmesTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectAlarmesTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParControle: result.prixParControle / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getRiaTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("riaTarifs"));
  try {
    const results = await db.select().from(riaTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRiaTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParRIA: result.prixParRIA / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getColonnesSechesTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("colonnesSechesTarifs"));
  try {
    const results = await db.select().from(colonnesSechesTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectColonnesSechesTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParColonne: result.prixParColonne / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getPortesCoupeFeuTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("portesCoupeFeuTarifs"));
  try {
    const results = await db.select().from(portesCoupeFeuTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectPortesCoupeFeuTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParPorte: result.prixParPorte / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
