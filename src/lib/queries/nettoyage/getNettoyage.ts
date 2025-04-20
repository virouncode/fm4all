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
import { roundSurface } from "@/lib/roundSurface";
import { selectNettoyageQuantitesSchema } from "@/zod-schemas/nettoyageQuantites";
import { selectRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse";
import { selectNettoyageTarifsSchema } from "@/zod-schemas/nettoyageTarifs";
import { selectVitrerieTarifsSchema } from "@/zod-schemas/nettoyageVitrerie";
import { and, eq, getTableColumns } from "drizzle-orm";

export const getNettoyageQuantites = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(nettoyageQuantites)
      .where(eq(nettoyageQuantites.surface, roundedSurface));
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

export const getNettoyageAllQuantites = async () => {
  try {
    const results = await db.select().from(nettoyageQuantites);
    if (results.length === 0) return [];
    // const validatedResults = results.map((result) =>
    //   selectNettoyageQuantitesSchema.parse(result)
    // );
    // const data = validatedResults.map((result) => ({
    //   ...result,
    //   freqAnnuelle: result.freqAnnuelle / RATIO,
    // }));
    return results.map((result) => ({
      ...result,
      freqAnnuelle: result.freqAnnuelle / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageTarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageTarifs),
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
      .from(nettoyageTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageTarifs.fournisseurId)
      )
      .where(eq(nettoyageTarifs.surface, roundedSurface));
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

export const getRepasseTarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageRepasseTarifs),
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
      .from(nettoyageRepasseTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageRepasseTarifs.fournisseurId)
      )
      .where(and(eq(nettoyageRepasseTarifs.surface, roundedSurface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRepasseTarifsSchema.parse(result)
    );

    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      hParPassage: validatedResult.hParPassage / RATIO,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getVitrerieTarifs = async () => {
  try {
    const results = await db
      .select({
        ...getTableColumns(nettoyageVitrerieTarifs),
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
      .from(nettoyageVitrerieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, nettoyageVitrerieTarifs.fournisseurId)
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectVitrerieTarifsSchema.parse(result)
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
      minFacturation: validatedResult.minFacturation / RATIO,
      fraisDeplacement: validatedResult.fraisDeplacement / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

//TODO valider le schema
export const getNettoyageTarifsFournisseur = async (fournisseurId: number) => {
  try {
    const results = await db
      .select()
      .from(nettoyageTarifs)
      .where(eq(nettoyageTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) return [];
    // const validatedResults = results.map((result) =>
    //   selectNettoyageTarifsSchema.parse(result)
    // );
    // const data = validatedResults.map((result) => ({
    //   ...result,
    //   hParPassage: result.hParPassage / RATIO,
    //   tauxHoraire: result.tauxHoraire / RATIO,
    // }));
    return results.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageTarifsRepasseFournisseur = async (
  fournisseurId: number
) => {
  try {
    const results = await db
      .select()
      .from(nettoyageRepasseTarifs)
      .where(eq(nettoyageRepasseTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) return [];
    // const validatedResults = results.map((result) =>
    //   selectNettoyageTarifsSchema.parse(result)
    // );
    // const data = validatedResults.map((result) => ({
    //   ...result,
    //   hParPassage: result.hParPassage / RATIO,
    //   tauxHoraire: result.tauxHoraire / RATIO,
    // }));
    return results.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};
