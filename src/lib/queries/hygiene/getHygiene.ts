import { RATIO } from "@/constants/ratio";
import { db } from "@/db";
import {
  fournisseurs,
  hygieneConsoTarifs,
  hygieneDistribQuantites,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectHygieneConsoTarifsSchema } from "@/zod-schemas/hygieneConsoTarifs";
import { selectHygieneDistribQuantitesSchema } from "@/zod-schemas/hygieneDistribQuantites";
import { selectHygieneDistribTarifsSchema } from "@/zod-schemas/hygieneDistribTarifs";
import { selectHygieneInstalDistribTarifsSchema } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { and, eq, getTableColumns } from "drizzle-orm";

export const getHygieneDistribQuantites = async (effectif: string) => {
  try {
    const results = await db
      .select()
      .from(hygieneDistribQuantites)
      .where(eq(hygieneDistribQuantites.effectif, parseInt(effectif)));

    if (results.length === 0) {
      return null;
    }
    const formattedResults = {
      ...results[0],
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

export const getHygieneDistribTarifs = async (fournisseurId?: string) => {
  if (!fournisseurId || isNaN(parseInt(fournisseurId))) return [];
  if (fournisseurId === "9") fournisseurId = "12";

  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneDistribTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(hygieneDistribTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneDistribTarifs.fournisseurId, fournisseurs.id)
      )
      .where(eq(hygieneDistribTarifs.fournisseurId, parseInt(fournisseurId)));

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

export const getHygieneInstalDistribTarif = async (
  effectif: string,
  fournisseurId?: string
) => {
  if (!fournisseurId || isNaN(parseInt(fournisseurId))) return null;
  if (fournisseurId === "9") fournisseurId = "12";
  try {
    const results = await db
      .select()
      .from(hygieneInstalDistribTarifs)
      .where(
        and(
          eq(hygieneInstalDistribTarifs.effectif, parseInt(effectif)),
          eq(hygieneInstalDistribTarifs.fournisseurId, parseInt(fournisseurId))
        )
      );

    if (results.length === 0) {
      return null;
    }
    const validatedResult = selectHygieneInstalDistribTarifsSchema.parse(
      results[0]
    );
    const data = {
      ...validatedResult,
      prixInstallation: validatedResult.prixInstallation / RATIO,
    };
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getHygieneConsosTarif = async (
  effectif: string,
  fournisseurId?: string
) => {
  if (!fournisseurId || isNaN(parseInt(fournisseurId))) return null;
  if (fournisseurId === "9") fournisseurId = "12";
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneConsoTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(hygieneConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneConsoTarifs.fournisseurId, fournisseurs.id)
      )
      .where(
        and(
          eq(hygieneConsoTarifs.effectif, parseInt(effectif)),
          eq(hygieneConsoTarifs.fournisseurId, parseInt(fournisseurId))
        )
      );

    if (results.length === 0) {
      return null;
    }
    const validatedResult = selectHygieneConsoTarifsSchema.parse(results[0]);
    const data = {
      ...validatedResult,
      paParPersonneEmp: validatedResult.paParPersonneEmp / RATIO,
      paParPersonnePh: validatedResult.paParPersonnePh / RATIO,
      paParPersonneSavon: validatedResult.paParPersonneSavon / RATIO,
      paParPersonneDesinfectant:
        validatedResult.paParPersonneDesinfectant / RATIO,
    };
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
