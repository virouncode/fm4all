import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  cafeConsoTarifs,
  cafeMachines,
  cafeMachinesTarifs,
  cafeQuantites,
  chocoConsoTarifs,
  fournisseurs,
  laitConsoTarifs,
  theConsoTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectCafeConsoTarifsSchema } from "@/zod-schemas/cafeConsoTarifs";
import { selectCafeMachinesSchema } from "@/zod-schemas/cafeMachine";
import { selectCafeMachinesTarifsSchema } from "@/zod-schemas/cafeMachinesTarifs";
import { selectCafeQuantitesSchema } from "@/zod-schemas/cafeQuantites";
import { selectChocoConsoTarifsSchema } from "@/zod-schemas/chocoConsoTarifs";
import { selectLaitConsoTarifsSchema } from "@/zod-schemas/laitConsoTarifs";
import { selectTheConsoTarifsSchema } from "@/zod-schemas/theConsoTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getCafeQuantites = async () => {
  try {
    const results = await db.select().from(cafeQuantites);
    if (results.length === 0) return [];
    return results.map((result) => selectCafeQuantitesSchema.parse(result));
  } catch (err) {
    errorHelper(err);
  }
};

export const getCafeMachinesTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(cafeMachinesTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(cafeMachinesTarifs)
      .innerJoin(
        fournisseurs,
        eq(cafeMachinesTarifs.fournisseurId, fournisseurs.id)
      );

    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectCafeMachinesTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixInstallation:
        result.prixInstallation !== null
          ? result.prixInstallation / RATIO
          : null,
      oneShot: result.oneShot !== null ? result.oneShot / RATIO : null,
      pa12M: result.pa12M !== null ? result.pa12M / RATIO : null,
      rac12M: result.rac12M !== null ? result.rac12M / RATIO : null,
      pa24M: result.pa24M !== null ? result.pa24M / RATIO : null,
      rac24M: result.rac24M !== null ? result.rac24M / RATIO : null,
      pa36M: result.pa36M !== null ? result.pa36M / RATIO : null,
      pa48M: result.pa48M !== null ? result.pa48M / RATIO : null,
      pa60M: result.pa60M !== null ? result.pa60M / RATIO : null,
      paMaintenance:
        result.paMaintenance !== null ? result.paMaintenance / RATIO : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getCafeConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(cafeConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(cafeConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, cafeConsoTarifs.fournisseurId)
      );

    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectCafeConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getLaitConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(laitConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(laitConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, laitConsoTarifs.fournisseurId)
      );

    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectLaitConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getChocoConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(chocoConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(chocoConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, chocoConsoTarifs.fournisseurId)
      );

    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectChocoConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getTheConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(theConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(theConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, theConsoTarifs.fournisseurId)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectTheConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getCafeMachines = async () => {
  try {
    const results = await db.select().from(cafeMachines);
    if (results.length === 0) return [];
    return results.map((result) => selectCafeMachinesSchema.parse(result));
  } catch (err) {
    errorHelper(err);
  }
};
