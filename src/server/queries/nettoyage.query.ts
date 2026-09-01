import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entrepriseRoles,
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
import { alias } from "drizzle-orm/pg-core";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import "server-only";

const imageDoc = alias(documents, "image_doc");

const prestataireColumns = {
  nomPrestataire: entreprises.nom,
  slogan: entrepriseInfos.slogan,
  logoStorageKey: documents.storageKey,
  anneeCreation: entrepriseInfos.anneeCreation,
  ca: entrepriseInfos.ca,
  effectifPrestataire: entrepriseInfos.effectif,
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
  } catch (error) {
    console.error("[queries] getNettoyageQuantites a échoué", error);
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
  } catch (error) {
    console.error("[queries] getNettoyageAllQuantites a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(nettoyageTarifs)
      .innerJoin(entreprises, eq(entreprises.id, nettoyageTarifs.entrepriseId))
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
      .leftJoin(imageDoc, eq(imageDoc.id, nettoyageTarifs.imageId))
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
  } catch (error) {
    console.error("[queries] getNettoyageTarifs a échoué", error);
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
  } catch (error) {
    console.error("[queries] getNettoyageTarifsPrestataire a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(nettoyageRepasseTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, nettoyageRepasseTarifs.entrepriseId),
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
      .leftJoin(imageDoc, eq(imageDoc.id, nettoyageRepasseTarifs.imageId))
      .where(eq(nettoyageRepasseTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRepasseTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
  } catch (error) {
    console.error("[queries] getRepasseTarifs a échoué", error);
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
  } catch (error) {
    console.error("[queries] getRepasseTarifsPrestataire a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(nettoyageVitrerieTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, nettoyageVitrerieTarifs.entrepriseId),
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
      .leftJoin(imageDoc, eq(imageDoc.id, nettoyageVitrerieTarifs.imageId));
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
  } catch (error) {
    console.error("[queries] getVitrerieTarifs a échoué", error);
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
  } catch (error) {
    console.error("[queries] getVitrerieTarifsPrestataire a échoué", error);
    return null;
  }
};
