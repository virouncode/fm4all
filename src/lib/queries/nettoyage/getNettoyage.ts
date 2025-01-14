import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  nettoyageQuantites,
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { GammeType } from "@/zod-schemas/gamme";
import { selectNettoyageQuantitesSchema } from "@/zod-schemas/nettoyageQuantites";
import { selectRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse";
import { selectNettoyageTarifsSchema } from "@/zod-schemas/nettoyageTarifs";
import { selectVitrerieTarifsSchema } from "@/zod-schemas/nettoyageVitrerie";
import { and, eq, getTableColumns } from "drizzle-orm";

export const getNettoyageQuantites = async (surface: string) => {
  try {
    const results = await db
      .select()
      .from(nettoyageQuantites)
      .where(eq(nettoyageQuantites.surface, parseInt(surface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      freqAnnuelle: result.freqAnnuelle / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageTarifs = async (surface: string) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageTarifs.fournisseurId)
      )
      .where(eq(nettoyageTarifs.surface, parseInt(surface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getRepasseTarif = async (
  surface: string,
  fournisseurId?: string,
  gamme?: GammeType
) => {
  if (!fournisseurId || !gamme || isNaN(parseInt(fournisseurId))) return null;

  try {
    const result = await db
      .select({
        ...getTableColumns(nettoyageRepasseTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageRepasseTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageRepasseTarifs.fournisseurId)
      )
      .where(
        and(
          eq(nettoyageRepasseTarifs.surface, parseInt(surface)),
          eq(nettoyageRepasseTarifs.fournisseurId, parseInt(fournisseurId)),
          eq(nettoyageRepasseTarifs.gamme, gamme)
        )
      );
    if (result.length === 0) return null;
    const validatedResult = selectRepasseTarifsSchema.parse(result[0]);

    const data = {
      ...validatedResult,
      hParPassage: validatedResult.hParPassage / RATIO,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
    };
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getVitrerieTarif = async (fournisseurId?: string) => {
  if (!fournisseurId || isNaN(parseInt(fournisseurId))) return null;
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageVitrerieTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(nettoyageVitrerieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageVitrerieTarifs.fournisseurId)
      )
      .where(
        and(eq(nettoyageVitrerieTarifs.fournisseurId, parseInt(fournisseurId)))
      );
    if (results.length === 0) return null;
    const validatedResult = selectVitrerieTarifsSchema.parse(results[0]);
    const data = {
      ...validatedResult,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
      minFacturation: validatedResult.minFacturation / RATIO,
      fraisDeplacement: validatedResult.fraisDeplacement / RATIO,
    };
    return data;
  } catch (err) {
    errorHelper(err);
  }
};
