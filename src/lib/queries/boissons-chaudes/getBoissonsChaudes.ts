import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  cafeConsoTarifs,
  cafeMachines,
  cafeMachinesTarifs,
  chocolatConsoTarifs,
  fournisseurs,
  laitConsoTarifs,
  sucreConsoTarifs,
  theConsoTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectCafeConsoTarifsSchema } from "@/zod-schemas/cafeConsoTarifs";
import { selectCafeMachinesSchema } from "@/zod-schemas/cafeMachine";
import { selectCafeMachinesTarifsSchema } from "@/zod-schemas/cafeMachinesTarifs";
import { selectChocolatConsoTarifsSchema } from "@/zod-schemas/chocolatConsoTarifs";
import { selectLaitConsoTarifsSchema } from "@/zod-schemas/laitConsoTarifs";
import { selectSucreConsoTarifsSchema } from "@/zod-schemas/sucreConsoTarifs";
import { selectTheConsoTarifsSchema } from "@/zod-schemas/theConsoTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getCafeMachinesTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(cafeMachinesTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
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
      oneShot: result.oneShot !== null ? result.oneShot / RATIO : null,
      pa12M: result.pa12M !== null ? result.pa12M / RATIO : null,
      rac12M: result.rac12M !== null ? result.rac12M / RATIO : null,
      pa24M: result.pa24M !== null ? result.pa24M / RATIO : null,
      rac24M: result.rac24M !== null ? result.rac24M / RATIO : null,
      pa36M: result.pa36M !== null ? result.pa36M / RATIO : null,
      pa48M: result.pa48M !== null ? result.pa48M / RATIO : null,
      paMaintenance:
        result.paMaintenance !== null ? result.paMaintenance / RATIO : null,
      fraisInstallation:
        result.fraisInstallation !== null
          ? result.fraisInstallation / RATIO
          : null,
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
        logoUrl: fournisseurs.logoUrl,
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
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
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
        logoUrl: fournisseurs.logoUrl,
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
      prixUnitaireDosette:
        result.prixUnitaireDosette !== null
          ? result.prixUnitaireDosette / RATIO
          : null,
      prixUnitaireFrais:
        result.prixUnitaireFrais !== null
          ? result.prixUnitaireFrais / RATIO
          : null,
      prixUnitairePoudre:
        result.prixUnitairePoudre !== null
          ? result.prixUnitairePoudre / RATIO
          : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getChocolatConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(chocolatConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
      })
      .from(chocolatConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, chocolatConsoTarifs.fournisseurId)
      );

    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectChocolatConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaireSachet:
        result.prixUnitaireSachet !== null
          ? result.prixUnitaireSachet / RATIO
          : null,
      prixUnitairePoudre:
        result.prixUnitairePoudre !== null
          ? result.prixUnitairePoudre / RATIO
          : null,
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
        logoUrl: fournisseurs.logoUrl,
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
      prixUnitaire:
        result.prixUnitaire !== null ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getSucreConsoTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(sucreConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
      })
      .from(sucreConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, sucreConsoTarifs.fournisseurId)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSucreConsoTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire:
        result.prixUnitaire !== null ? result.prixUnitaire / RATIO : null,
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
