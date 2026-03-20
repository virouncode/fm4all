import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entreprises,
  nettoyageQuantites,
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieTarifs,
} from "@/db/schema";
import {
  getGlobalTag,
  getPrestataireTag,
  getSurfaceTag,
} from "@/lib/data-cache";
import { roundSurface } from "@/lib/utils/roundSurface";
import { selectNettoyageQuantitesSchema } from "@/zod-schemas/nettoyageQuantites.schema";
import { selectRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse.schema";
import {
  selectNettoyageTarifsFournisseurSchema,
  selectNettoyageTarifsSchema,
} from "@/zod-schemas/nettoyageTarifs.schema";
import {
  selectVitrerieTarifsFournisseurSchema,
  selectVitrerieTarifsSchema,
} from "@/zod-schemas/nettoyageVitrerie.schema";
import { and, eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const prestataireColumns = {
  nomPrestataire: entreprises.nom,
  slogan: entrepriseInfos.slogan,
  logoStorageKey: documents.storageKey,
  anneeCreation: entrepriseInfos.anneeCreation,
  ca: entrepriseInfos.ca,
  effectif: entrepriseInfos.effectif,
  nbClients: entrepriseInfos.nbClients,
  noteGoogle: entrepriseInfos.noteGoogle,
  nbAvis: entrepriseInfos.nbAvis,
};

export const getNettoyageQuantites = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("nettoyageQuantites", surface));

  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(nettoyageQuantites)
      .where(eq(nettoyageQuantites.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result),
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

export const getNettoyageAllQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("nettoyageQuantites"));
  try {
    const results = await db.select().from(nettoyageQuantites);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result),
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

export const getNettoyageTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("nettoyageTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageTarifs),
        ...prestataireColumns,
      })
      .from(nettoyageTarifs)
      .innerJoin(entreprises, eq(entreprises.id, nettoyageTarifs.entrepriseId))
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId))
      .where(eq(nettoyageTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsSchema.parse(result),
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

export const getNettoyageTarifsPrestataire = async (entrepriseId: string) => {
  "use cache";
  cacheTag(getPrestataireTag("nettoyageTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(nettoyageTarifs)
      .where(eq(nettoyageTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsFournisseurSchema.parse(result),
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

export const getRepasseTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("repasseTarifs", surface));
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageRepasseTarifs),
        ...prestataireColumns,
      })
      .from(nettoyageRepasseTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, nettoyageRepasseTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId))
      .where(and(eq(nettoyageRepasseTarifs.surface, roundedSurface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRepasseTarifsSchema.parse(result),
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

export const getRepasseTarifsPrestataire = async (entrepriseId: string) => {
  "use cache";
  cacheTag(getPrestataireTag("repasseTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(nettoyageRepasseTarifs)
      .where(eq(nettoyageRepasseTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsFournisseurSchema.parse(result),
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

export const getVitrerieTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("vitrerieTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageVitrerieTarifs),
        ...prestataireColumns,
      })
      .from(nettoyageVitrerieTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, nettoyageVitrerieTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectVitrerieTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
      minFacturation: result.minFacturation / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getVitrerieTarifsPrestataire = async (entrepriseId: string) => {
  "use cache";
  cacheTag(getPrestataireTag("vitrerieTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(nettoyageVitrerieTarifs)
      .where(eq(nettoyageVitrerieTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectVitrerieTarifsFournisseurSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
      minFacturation: result.minFacturation / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
    return data[0];
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return null;
  }
};
