import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  hygieneConsoTarifs,
  hygieneDistribQuantites,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
} from "@/db/schema";
import {
  getEffectifTag,
  getFournisseurTag,
  getGlobalTag,
} from "@/lib/data-cache";
import { errorHelper } from "@/lib/errorHelper";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import {
  selectHygieneConsoTarifsFournisseurSchema,
  selectHygieneConsoTarifsSchema,
} from "@/zod-schemas/hygieneConsoTarifs";
import { selectHygieneDistribQuantitesSchema } from "@/zod-schemas/hygieneDistribQuantites";
import {
  selectHygieneDistribTarifsFournisseurSchema,
  selectHygieneDistribTarifsSchema,
} from "@/zod-schemas/hygieneDistribTarifs";
import {
  selectHygieneInstalDistribTarifsFournisseurSchema,
  selectHygieneInstalDistribTarifsSchema,
} from "@/zod-schemas/hygieneInstalDistribTarifs";
import { selectHygieneMinFacturationSchema } from "@/zod-schemas/hygieneMinFacturation";
import { and, eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getHygieneDistribQuantite = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneDistribQuantites", effectif));
  console.log(`🔍 DB REQUEST: getHygieneDistribQuantite(${effectif})`);
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select()
      .from(hygieneDistribQuantites)
      .where(eq(hygieneDistribQuantites.effectif, roundedEffectif));

    if (results.length === 0) {
      return null;
    }
    const formattedResults = {
      ...results[0],
      nbDistribEmpPoubelle: results[0].nbDistribEmp,
      nbDistribDesinfectant: results[0].nbDistribPh,
      nbDistribParfum: results[0].nbDistribEmp,
      nbDistribBalai: results[0].nbDistribPh,
      nbDistribPoubelle: Math.ceil(results[0].nbDistribPh / 2),
    };

    return selectHygieneDistribQuantitesSchema.parse(formattedResults);
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneDistribTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("hygieneDistribTarifs"));
  console.log(`🔍 DB REQUEST: getHygieneDistribTarifs`);
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneDistribTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
        locationUrl: fournisseurs.locationUrl,
        anneeCreation: fournisseurs.anneeCreation,
        ca: fournisseurs.ca,
        effectif: fournisseurs.effectif,
        nbClients: fournisseurs.nbClients,
        noteGoogle: fournisseurs.noteGoogle,
        nbAvis: fournisseurs.nbAvis,
      })
      .from(hygieneDistribTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneDistribTarifs.fournisseurId, fournisseurs.id)
      );
    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneDistribTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot ? result.oneShot / RATIO : null,
      pa12M: result.pa12M ? result.pa12M / RATIO : null,
      pa24M: result.pa24M ? result.pa24M / RATIO : null,
      pa36M: result.pa36M ? result.pa36M / RATIO : null,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneMinFacturation = async () => {
  "use cache";
  cacheTag(getGlobalTag("hygieneMinFacturation"));
  console.log(`🔍 DB REQUEST: getHygieneMinFacturation`);
  try {
    const results = await db.select().from(hygieneMinFacturation);
    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneMinFacturationSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      minFacturation: result.minFacturation
        ? result.minFacturation / RATIO
        : null,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneMinFacturationFournisseur = async (
  fournisseurId: number
) => {
  "use cache";
  cacheTag(getFournisseurTag("hygieneMinFacturation", fournisseurId));
  console.log(`🔍 DB REQUEST: getHygieneMinFacturationFournisseur`);
  try {
    const results = await db
      .select()
      .from(hygieneMinFacturation)
      .where(eq(hygieneMinFacturation.fournisseurId, fournisseurId));
    if (results.length === 0) {
      return null;
    }
    const validatedResults = results.map((result) =>
      selectHygieneMinFacturationSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      minFacturation: result.minFacturation
        ? result.minFacturation / RATIO
        : null,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneDistribTarifsFournisseur = async (
  fournisseurId: number
) => {
  "use cache";
  cacheTag(getFournisseurTag("hygieneDistribTarifs", fournisseurId));
  console.log(
    `🔍 DB REQUEST: getHygieneDistribTarifsFournisseur(${fournisseurId})`
  );
  try {
    const results = await db
      .select()
      .from(hygieneDistribTarifs)
      .where(eq(hygieneDistribTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneDistribTarifsFournisseurSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot ? result.oneShot / RATIO : null,
      pa12M: result.pa12M ? result.pa12M / RATIO : null,
      pa24M: result.pa24M ? result.pa24M / RATIO : null,
      pa36M: result.pa36M ? result.pa36M / RATIO : null,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneInstalDistribTarifs = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneInstalDistribTarifs", effectif));
  console.log(`🔍 DB REQUEST: getHygieneInstalDistribTarifs(${effectif})`);
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select()
      .from(hygieneInstalDistribTarifs)
      .where(and(eq(hygieneInstalDistribTarifs.effectif, roundedEffectif)));

    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneInstalDistribTarifsSchema.parse(result)
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      prixInstallation: validatedResult.prixInstallation / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneInstalDistribTarifsFournisseur = async (
  fournisseurId: number
) => {
  "use cache";
  cacheTag(getFournisseurTag("hygieneInstalDistribTarifs", fournisseurId));
  console.log(
    `🔍 DB REQUEST: getHygieneInstalDistribTarifsFournisseur(${fournisseurId})`
  );
  try {
    const results = await db
      .select()
      .from(hygieneInstalDistribTarifs)
      .where(eq(hygieneInstalDistribTarifs.fournisseurId, fournisseurId));

    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneInstalDistribTarifsFournisseurSchema.parse(result)
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      prixInstallation: validatedResult.prixInstallation / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneConsosTarifs = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneConsosTarifs", effectif));
  console.log(`🔍 DB REQUEST: getHygieneConsosTarifs(${effectif})`);
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
        locationUrl: fournisseurs.locationUrl,
        anneeCreation: fournisseurs.anneeCreation,
        ca: fournisseurs.ca,
        effectif: fournisseurs.effectif,
        nbClients: fournisseurs.nbClients,
        noteGoogle: fournisseurs.noteGoogle,
        nbAvis: fournisseurs.nbAvis,
      })
      .from(hygieneConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneConsoTarifs.fournisseurId, fournisseurs.id)
      )
      .where(and(eq(hygieneConsoTarifs.effectif, roundedEffectif)));

    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneConsoTarifsSchema.parse(result)
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      paParPersonneEmp: validatedResult.paParPersonneEmp / RATIO,
      paParPersonnePh: validatedResult.paParPersonnePh / RATIO,
      paParPersonneSavon: validatedResult.paParPersonneSavon / RATIO,
      paParPersonneDesinfectant:
        validatedResult.paParPersonneDesinfectant / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneConsosTarifsFournisseur = async (
  fournisseurId: number
) => {
  "use cache";
  cacheTag(getFournisseurTag("hygieneConsosTarifs", fournisseurId));
  console.log(
    `🔍 DB REQUEST: getHygieneConsosTarifsFournisseur(${fournisseurId})`
  );
  try {
    const results = await db
      .select()
      .from(hygieneConsoTarifs)
      .where(eq(hygieneConsoTarifs.fournisseurId, fournisseurId));

    if (results.length === 0) {
      return [];
    }
    const validatedResults = results.map((result) =>
      selectHygieneConsoTarifsFournisseurSchema.parse(result)
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      paParPersonneEmp: validatedResult.paParPersonneEmp / RATIO,
      paParPersonnePh: validatedResult.paParPersonnePh / RATIO,
      paParPersonneSavon: validatedResult.paParPersonneSavon / RATIO,
      paParPersonneDesinfectant:
        validatedResult.paParPersonneDesinfectant / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
