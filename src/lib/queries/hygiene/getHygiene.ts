import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  hygieneConsoTarifs,
  hygieneDistribQuantites,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { selectHygieneConsoTarifsSchema } from "@/zod-schemas/hygieneConsoTarifs";
import { selectHygieneDistribQuantitesSchema } from "@/zod-schemas/hygieneDistribQuantites";
import { selectHygieneDistribTarifsSchema } from "@/zod-schemas/hygieneDistribTarifs";
import { selectHygieneInstalDistribTarifsSchema } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { and, eq, getTableColumns } from "drizzle-orm";

export const getHygieneDistribQuantite = async (effectif: string) => {
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
      minFacturation: result.minFacturation
        ? result.minFacturation / RATIO
        : null,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneInstalDistribTarifs = async (effectif: string) => {
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

export const getHygieneConsosTarifs = async (effectif: string) => {
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
