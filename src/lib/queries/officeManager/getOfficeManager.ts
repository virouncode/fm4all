import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  officeManagerQuantites,
  officeManagerTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectOfficeManagerQuantitesSchema } from "@/zod-schemas/officeManagerQuantites";
import { selectOfficeManagerTarifsSchema } from "@/zod-schemas/officeManagerTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getOfficeManagerQuantites = async (
  surface: string,
  effectif: string
) => {
  try {
    const resultsSurface = await db
      .select()
      .from(officeManagerQuantites)
      .where(eq(officeManagerQuantites.surface, parseInt(surface)));
    const resultsEffectif = await db
      .select()
      .from(officeManagerQuantites)
      .where(eq(officeManagerQuantites.effectif, parseInt(effectif)));
    if (resultsSurface.length === 0 || resultsEffectif.length === 0) {
      return [];
    }
    const results =
      (resultsSurface.find((result) => result.gamme === "essentiel")
        ?.demiJParSemaine as number) >=
      (resultsEffectif.find((result) => result.gamme === "essentiel")
        ?.demiJParSemaine as number)
        ? resultsSurface
        : resultsEffectif;
    const validatedResults = results.map((result) =>
      selectOfficeManagerQuantitesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};

export const getOfficeManagerTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(officeManagerTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(officeManagerTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, officeManagerTarifs.fournisseurId)
      );

    if (results.length === 0) return [];

    const validatedResults = results.map((result) =>
      selectOfficeManagerTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      demiTjm: result.demiTjm / RATIO,
    }));

    return data;
  } catch (err) {
    errorHelper(err);
  }
};
