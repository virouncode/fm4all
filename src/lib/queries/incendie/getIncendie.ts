import { RATIO } from "@/constants/ratio";
import { db } from "@/db";
import { fournisseurs, incendieQuantites, incendieTarifs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectIncendieQuantitesSchema } from "@/zod-schemas/incendieQuantites";
import { selectIncendieTarifsSchema } from "@/zod-schemas/incendieTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getIncendieQuantite = async (surface: string) => {
  try {
    const results = await db
      .select()
      .from(incendieQuantites)
      .where(eq(incendieQuantites.surface, parseInt(surface)));
    if (results.length === 0) return null;
    return selectIncendieQuantitesSchema.parse(results[0]);
  } catch (err) {
    errorHelper(err);
  }
};

export const getIncendieTarifs = async (surface: string) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(incendieTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(incendieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, incendieTarifs.fournisseurId)
      )
      .where(eq(incendieTarifs.surface, parseInt(surface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectIncendieTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixParExtincteur: result.prixParExtincteur / RATIO,
      prixParBaes: result.prixParBaes / RATIO,
      prixParTelBaes: result.prixParTelBaes / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
