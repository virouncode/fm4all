import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { fontaines, fontainesTarifs, fournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectFontainesTarifsSchema } from "@/zod-schemas/fontainesTarifs";
import { eq, getTableColumns } from "drizzle-orm";
import { selectFontainesModelesSchema } from "../../../zod-schemas/fontainesModeles";

export const getFontainesTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(fontainesTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        sloganFournisseur: fournisseurs.slogan,
        logoUrl: fournisseurs.logoUrl,
      })
      .from(fontainesTarifs)
      .innerJoin(
        fournisseurs,
        eq(fontainesTarifs.fournisseurId, fournisseurs.id)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFontainesTarifsSchema.parse(result)
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
      pa60M: result.pa60M !== null ? result.pa60M / RATIO : null,
      paMaintenance:
        result.paMaintenance !== null ? result.paMaintenance / RATIO : null,
      fraisInstallation:
        result.fraisInstallation !== null
          ? result.fraisInstallation / RATIO
          : null,
      paConsoFiltres:
        result.paConsoFiltres !== null ? result.paConsoFiltres / RATIO : null,
      paConsoCO2: result.paConsoCO2 !== null ? result.paConsoCO2 / RATIO : null,
      paConsoEauChaude:
        result.paConsoEauChaude !== null
          ? result.paConsoEauChaude / RATIO
          : null,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getFontaines = async () => {
  try {
    const results = await db.select().from(fontaines);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFontainesModelesSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};
