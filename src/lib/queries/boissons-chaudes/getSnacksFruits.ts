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
import { roundEffectif } from "@/lib/roundEffectif";
import { selectBoissonsQuantitesSchema } from "@/zod-schemas/boissonsQuantites";
import { selectBoissonsTarifsSchema } from "@/zod-schemas/boissonsTarifs";
import { selectFoodLivraisonTarifsSchema } from "@/zod-schemas/foodLivraisonTarifs";
import { selectFruitsQuantitesSchema } from "@/zod-schemas/fruitsQuantites";
import { selectFruitsTarifsSchema } from "@/zod-schemas/fruitsTarifs";
import { selectSnacksQuantitesSchema } from "@/zod-schemas/snacksQuantites";
import { selectSnacksTarifsSchema } from "@/zod-schemas/snacksTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getFruitsQuantites = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select()
      .from(fruitsQuantites)
      .where(
        eq(fruitsQuantites.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getFruitsTarifs = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select({
        ...getTableColumns(fruitsTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(fruitsTarifs)
      .innerJoin(fournisseurs, eq(fruitsTarifs.fournisseurId, fournisseurs.id))
      .where(
        eq(fruitsTarifs.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFruitsTarifsSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getSnacksQuantites = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select()
      .from(snacksQuantites)
      .where(
        eq(snacksQuantites.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getSnacksTarifs = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select({
        ...getTableColumns(snacksTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(snacksTarifs)
      .innerJoin(fournisseurs, eq(snacksTarifs.fournisseurId, fournisseurs.id))
      .where(
        eq(snacksTarifs.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSnacksTarifsSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getBoissonsQuantites = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select()
      .from(boissonsQuantites)
      .where(
        eq(boissonsQuantites.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getBoissonsTarifs = async (nbPersonnesFood?: string) => {
  if (!nbPersonnesFood) return [];
  try {
    const results = await db
      .select({
        ...getTableColumns(boissonsTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(boissonsTarifs)
      .innerJoin(
        fournisseurs,
        eq(boissonsTarifs.fournisseurId, fournisseurs.id)
      )
      .where(
        eq(boissonsTarifs.effectif, roundEffectif(parseInt(nbPersonnesFood)))
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectBoissonsTarifsSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getFoodLivraisonTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(foodLivraisonTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
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
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};
