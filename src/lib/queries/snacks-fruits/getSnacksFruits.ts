import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
  fournisseurs,
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectBoissonsQuantitesSchema } from "@/zod-schemas/boissonsQuantites";
import { selectBoissonsTarifsSchema } from "@/zod-schemas/boissonsTarifs";
import { selectFoodLivraisonTarifsSchema } from "@/zod-schemas/foodLivraisonTarifs";
import { selectFruitsQuantitesSchema } from "@/zod-schemas/fruitsQuantites";
import { selectFruitsTarifsSchema } from "@/zod-schemas/fruitsTarifs";
import { selectSnacksQuantitesSchema } from "@/zod-schemas/snacksQuantites";
import { selectSnacksTarifsSchema } from "@/zod-schemas/snacksTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getFruitsQuantites = async () => {
  try {
    const results = await db.select().from(fruitsQuantites);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getFruitsTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(fruitsTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
        locationUrl: fournisseurs.locationUrl,
        anneeCreation: fournisseurs.anneeCreation,
        ca: fournisseurs.ca,
        effectifFournisseur: fournisseurs.effectif,
        nbClients: fournisseurs.nbClients,
        noteGoogle: fournisseurs.noteGoogle,
        nbAvis: fournisseurs.nbAvis,
      })
      .from(fruitsTarifs)
      .innerJoin(fournisseurs, eq(fruitsTarifs.fournisseurId, fournisseurs.id));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixKg: result.prixKg ? result.prixKg / RATIO : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getSnacksQuantites = async () => {
  try {
    const results = await db.select().from(snacksQuantites);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getSnacksTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(snacksTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
        locationUrl: fournisseurs.locationUrl,
        anneeCreation: fournisseurs.anneeCreation,
        ca: fournisseurs.ca,
        effectifFournisseur: fournisseurs.effectif,
        nbClients: fournisseurs.nbClients,
        noteGoogle: fournisseurs.noteGoogle,
        nbAvis: fournisseurs.nbAvis,
      })
      .from(snacksTarifs)
      .innerJoin(fournisseurs, eq(snacksTarifs.fournisseurId, fournisseurs.id));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getBoissonsQuantites = async () => {
  try {
    const results = await db.select().from(boissonsQuantites);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getBoissonsTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(boissonsTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
        locationUrl: fournisseurs.locationUrl,
        anneeCreation: fournisseurs.anneeCreation,
        ca: fournisseurs.ca,
        effectifFournisseur: fournisseurs.effectif,
        nbClients: fournisseurs.nbClients,
        noteGoogle: fournisseurs.noteGoogle,
        nbAvis: fournisseurs.nbAvis,
      })
      .from(boissonsTarifs)
      .innerJoin(
        fournisseurs,
        eq(boissonsTarifs.fournisseurId, fournisseurs.id)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getFoodLivraisonTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(foodLivraisonTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
      })
      .from(foodLivraisonTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, foodLivraisonTarifs.fournisseurId)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFoodLivraisonTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
      panierMin: result.panierMin ? result.panierMin / RATIO : null,
      seuilFranco: result.seuilFranco ? result.seuilFranco / RATIO : null,
      prixUnitaireSiCafe: result.prixUnitaireSiCafe / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};
