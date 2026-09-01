import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  boissonsQuantites,
  boissonsTarifs,
  documents,
  entrepriseInfos,
  entrepriseRoles,
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
import { and, eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const imageDoc = alias(documents, "image_doc");

export const getFruitsQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("fruitsQuantites"));
  try {
    const results = await db.select().from(fruitsQuantites);
    if (results.length === 0) return [];
    return results.map((result) => selectFruitsQuantitesSchema.parse(result));
  } catch (error) {
    console.error("[queries] getFruitsQuantites a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(fruitsTarifs)
      .innerJoin(entreprises, eq(entreprises.id, fruitsTarifs.entrepriseId))
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
      .leftJoin(imageDoc, eq(imageDoc.id, fruitsTarifs.imageId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixKg: result.prixKg ? result.prixKg / RATIO : null,
    }));
  } catch (error) {
    console.error("[queries] getFruitsTarifs a échoué", error);
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
  } catch (error) {
    console.error("[queries] getSnacksQuantites a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(snacksTarifs)
      .innerJoin(entreprises, eq(entreprises.id, snacksTarifs.entrepriseId))
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
      .leftJoin(imageDoc, eq(imageDoc.id, snacksTarifs.imageId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (error) {
    console.error("[queries] getSnacksTarifs a échoué", error);
    return [];
  }
};

export const getBoissonsQuantites = async () => {
  "use cache";
  cacheTag(getGlobalTag("boissonsQuantites"));
  try {
    const results = await db.select().from(boissonsQuantites);
    if (results.length === 0) return [];
    return results.map((result) => selectBoissonsQuantitesSchema.parse(result));
  } catch (error) {
    console.error("[queries] getBoissonsQuantites a échoué", error);
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
        imageStorageKey: imageDoc.storageKey,
      })
      .from(boissonsTarifs)
      .innerJoin(entreprises, eq(entreprises.id, boissonsTarifs.entrepriseId))
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
      .leftJoin(imageDoc, eq(imageDoc.id, boissonsTarifs.imageId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (error) {
    console.error("[queries] getBoissonsTarifs a échoué", error);
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
  } catch (error) {
    console.error("[queries] getFoodLivraisonTarifs a échoué", error);
    return [];
  }
};
