import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  boissonsQuantites,
  boissonsTarifs,
  documents,
  entrepriseInfos,
  entreprises,
  foodLivraisonTarifs,
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
} from "@/db/schema";
import { getGlobalTag } from "@/lib/data-cache";
import { selectBoissonsQuantitesSchema } from "@/zod-schemas/boissonsQuantites.schema";
import { selectBoissonsTarifsSchema } from "@/zod-schemas/boissonsTarifs.schema";
import { selectFoodLivraisonTarifsSchema } from "@/zod-schemas/foodLivraisonTarifs.schema";
import { selectFruitsQuantitesSchema } from "@/zod-schemas/fruitsQuantites.schema";
import { selectFruitsTarifsSchema } from "@/zod-schemas/fruitsTarifs.schema";
import { selectSnacksQuantitesSchema } from "@/zod-schemas/snacksQuantites.schema";
import { selectSnacksTarifsSchema } from "@/zod-schemas/snacksTarifs.schema";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getFruitsQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("fruitsQuantites"));
  try {
    const results = await db.select().from(fruitsQuantites);
    if (results.length === 0) return [];
    return results.map((result) => selectFruitsQuantitesSchema.parse(result));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getFruitsTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("fruitsTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(fruitsTarifs),
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
      .from(fruitsTarifs)
      .innerJoin(entreprises, eq(entreprises.id, fruitsTarifs.entrepriseId))
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixKg: result.prixKg ? result.prixKg / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getSnacksQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("snacksQuantites"));
  try {
    const results = await db.select().from(snacksQuantites);
    if (results.length === 0) return [];
    return results.map((result) => selectSnacksQuantitesSchema.parse(result));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getSnacksTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("snacksTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(snacksTarifs),
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
      .from(snacksTarifs)
      .innerJoin(entreprises, eq(entreprises.id, snacksTarifs.entrepriseId))
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getBoissonsQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("boissonsQuantites"));
  try {
    const results = await db.select().from(boissonsQuantites);
    if (results.length === 0) return [];
    return results.map((result) =>
      selectBoissonsQuantitesSchema.parse(result),
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getBoissonsTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("boissonsTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(boissonsTarifs),
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
      .from(boissonsTarifs)
      .innerJoin(entreprises, eq(entreprises.id, boissonsTarifs.entrepriseId))
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getFoodLivraisonTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("foodLivraisonTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(foodLivraisonTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
      })
      .from(foodLivraisonTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, foodLivraisonTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFoodLivraisonTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
      panierMin: result.panierMin ? result.panierMin / RATIO : null,
      seuilFranco: result.seuilFranco ? result.seuilFranco / RATIO : null,
      prixUnitaireSiCafe: result.prixUnitaireSiCafe / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
