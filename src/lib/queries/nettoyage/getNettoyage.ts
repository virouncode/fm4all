import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  fournisseurs,
  nettoyageOffres,
  nettoyageProduits,
  nettoyageQuantites,
  nettoyageRepasseProduits,
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieOffres,
  nettoyageVitrerieProduits,
  nettoyageVitrerieTarifs,
} from "@/db/schema";
import {
  getFournisseurSurfaceGammeTag,
  getFournisseurTag,
  getGlobalTag,
  getOffreTag,
  getProduitTag,
  getSurfaceTag,
} from "@/lib/data-cache";
import { errorHelper } from "@/lib/errorHelper";
import { roundSurface } from "@/lib/utils/roundSurface";
import { GammeType } from "@/zod-schemas/gamme";
import { selectNettoyageOffreSchema } from "@/zod-schemas/nettoyageOffre";
import { selectNettoyageProduitSchema } from "@/zod-schemas/nettoyageProduit";
import { selectNettoyageQuantitesSchema } from "@/zod-schemas/nettoyageQuantites";
import { selectRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse";
import {
  selectNettoyageTarifsFournisseurSchema,
  selectNettoyageTarifsSchema,
} from "@/zod-schemas/nettoyageTarifs";
import {
  selectVitrerieTarifsFournisseurSchema,
  selectVitrerieTarifsSchema,
} from "@/zod-schemas/nettoyageVitrerie";
import { selectNettoyageVitrerieOffreSchema } from "@/zod-schemas/nettoyageVitrerieOffre";
import { selectNettoyageVitrerieProduitSchema } from "@/zod-schemas/nettoyageVitrerieProduit";
import { and, eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getNettoyageQuantites = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("nettoyageQuantites", surface));
  console.log(`🔍 DB REQUEST: getNettoyageQuantites(${surface})`);

  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(nettoyageQuantites)
      .where(eq(nettoyageQuantites.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result),
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
  "use cache";
  cacheTag(getGlobalTag("nettoyageQuantites"));
  console.log(`🔍 DB REQUEST: getNettoyageQuantites`);
  try {
    console.log(`🔍 DB REQUEST: getNettoyageAllQuantites`);
    const results = await db.select().from(nettoyageQuantites);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result),
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

export const getNettoyageProduits = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("nettoyageProduits", surface));
  console.log(`🔍 DB REQUEST: getNettoyageProduits(${surface})`);
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(nettoyageProduits)
      .where(eq(nettoyageProduits.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageProduitSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
    }));
    return data;
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageProduit = async (produitId: number) => {
  "use cache";
  cacheTag(getProduitTag("nettoyageProduit", produitId));
  console.log(`🔍 DB REQUEST: getNettoyageProduit(${produitId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageProduits)
      .where(eq(nettoyageProduits.id, produitId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageProduitSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageOffres = async (produitId: number) => {
  "use cache";
  cacheTag(getProduitTag("nettoyageOffres", produitId));
  console.log(`🔍 DB REQUEST: getNettoyageOffres(${produitId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageOffres)
      .where(eq(nettoyageOffres.produitId, produitId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageOffreSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageOffre = async (offreId: number) => {
  "use cache";
  cacheTag(getOffreTag("nettoyageOffre", offreId));
  console.log(`🔍 DB REQUEST: getNettoyageOffre(${offreId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageOffres)
      .where(eq(nettoyageOffres.id, offreId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageOffreSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getNettoyageTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("nettoyageTarifs", surface));
  console.log(`🔍 DB REQUEST: getNettoyageTarifs(${surface})`);
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
        eq(fournisseurs.id, nettoyageTarifs.fournisseurId),
      )
      .where(eq(nettoyageTarifs.surface, roundedSurface));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsSchema.parse(result),
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

//TODO valider le schema
export const getNettoyageTarifsFournisseur = async (fournisseurId: number) => {
  "use cache";
  cacheTag(getFournisseurTag("nettoyageTarifs", fournisseurId));
  console.log(`🔍 DB REQUEST: getNettoyageTarifsFournisseur(${fournisseurId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageTarifs)
      .where(eq(nettoyageTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsFournisseurSchema.parse(result),
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

export const getRepasseProduit = async (
  fournisseurId: number,
  roundedSurface: number,
  gamme: GammeType,
) => {
  "use cache";
  console.log(
    `🔍 DB REQUEST: getRepasseProduit(${fournisseurId}, ${roundedSurface}, ${gamme})`,
  );
  cacheTag(
    getFournisseurSurfaceGammeTag(
      "repasseProduit",
      fournisseurId,
      roundedSurface,
      gamme,
    ),
  );
  try {
    const results = await db
      .select()
      .from(nettoyageRepasseProduits)
      .where(
        and(
          eq(nettoyageRepasseProduits.surface, roundedSurface),
          eq(nettoyageRepasseProduits.gamme, gamme),
        ),
      );
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageProduitSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      hParPassage: result.hParPassage / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getRepasseOffre = async (produitId: number) => {
  "use cache";
  cacheTag(getProduitTag("repasseOffre", produitId));
  console.log(`🔍 DB REQUEST: getRepasseOffre(${produitId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageOffres)
      .where(eq(nettoyageOffres.produitId, produitId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageOffreSchema.parse(result),
    );
    const data = validatedResults.map((result) => ({
      ...result,
      tauxHoraire: result.tauxHoraire / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getRepasseTarifs = async (surface: string) => {
  "use cache";
  cacheTag(getSurfaceTag("repasseTarifs", surface));
  console.log(`🔍 DB REQUEST: getRepasseTarifs(${surface})`);
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
        eq(fournisseurs.id, nettoyageRepasseTarifs.fournisseurId),
      )
      .where(and(eq(nettoyageRepasseTarifs.surface, roundedSurface)));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRepasseTarifsSchema.parse(result),
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

export const getRepasseTarifsFournisseur = async (fournisseurId: number) => {
  "use cache";
  cacheTag(getFournisseurTag("repasseTarifs", fournisseurId));
  console.log(`🔍 DB REQUEST: getRepasseTarifsFournisseur(${fournisseurId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageRepasseTarifs)
      .where(eq(nettoyageRepasseTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectNettoyageTarifsFournisseurSchema.parse(result),
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

export const getVitrerieTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("vitrerieTarifs"));
  console.log(`🔍 DB REQUEST: getVitrerieTarifs`);
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
        eq(fournisseurs.id, nettoyageVitrerieTarifs.fournisseurId),
      );
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectVitrerieTarifsSchema.parse(result),
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

export const getVitrerieProduitForFournisseur = async (
  fournisseurId: number,
) => {
  "use cache";
  cacheTag(getFournisseurTag("vitrerieProduit", fournisseurId));
  console.log(
    `🔍 DB REQUEST: getVitrerieProduitForFournisseur(${fournisseurId})`,
  );
  try {
    const results = await db
      .select()
      .from(nettoyageVitrerieProduits)
      .where(eq(nettoyageVitrerieProduits.fournisseurId, fournisseurId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectNettoyageVitrerieProduitSchema.parse(result),
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      minFacturation: validatedResult.minFacturation / RATIO,
      fraisDeplacement: validatedResult.fraisDeplacement / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};

export const getVitrerieOffre = async (produitId: number) => {
  "use cache";
  cacheTag(getProduitTag("vitrerieOffre", produitId));
  console.log(`🔍 DB REQUEST: getVitrerieOffre(${produitId})`);
  try {
    const result = await db
      .select()
      .from(nettoyageVitrerieOffres)
      .where(eq(nettoyageVitrerieOffres.produitId, produitId))
      .limit(1);
    if (result.length === 0) return null;
    const validatedResult = selectNettoyageVitrerieOffreSchema.parse(result[0]);
    return {
      ...validatedResult,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
    };
  } catch (err) {
    errorHelper(err);
  }
};

export const getVitrerieTarifsFournisseur = async (fournisseurId: number) => {
  "use cache";
  cacheTag(getFournisseurTag("vitrerieTarifs", fournisseurId));
  console.log(`🔍 DB REQUEST: getVitrerieTarifsFournisseur(${fournisseurId})`);
  try {
    const results = await db
      .select()
      .from(nettoyageVitrerieTarifs)
      .where(eq(nettoyageVitrerieTarifs.fournisseurId, fournisseurId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectVitrerieTarifsFournisseurSchema.parse(result),
    );
    const data = validatedResults.map((validatedResult) => ({
      ...validatedResult,
      tauxHoraire: validatedResult.tauxHoraire / RATIO,
      minFacturation: validatedResult.minFacturation / RATIO,
      fraisDeplacement: validatedResult.fraisDeplacement / RATIO,
    }));
    return data[0];
  } catch (err) {
    errorHelper(err);
  }
};
