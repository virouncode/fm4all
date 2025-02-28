import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  alarmesTarifs,
  colonnesSechesTarifs,
  exutoiresParkingTarifs,
  exutoiresTarifs,
  fournisseurs,
  incendieQuantites,
  incendieTarifs,
  portesCoupeFeuTarifs,
  riaTarifs,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { roundSurface } from "@/lib/roundSurface";
import { selectAlarmesTarifsSchema } from "@/zod-schemas/alarmesTarifs";
import { selectColonnesSechesTarifsSchema } from "@/zod-schemas/colonnesSechesTarifs";
import { selectExutoiresTarifsSchema } from "@/zod-schemas/exutoiresTarifs";
import { selectIncendieQuantitesSchema } from "@/zod-schemas/incendieQuantites";
import { selectIncendieTarifsSchema } from "@/zod-schemas/incendieTarifs";
import { selectPortesCoupeFeuTarifsSchema } from "@/zod-schemas/portesCoupeFeuTarifs";
import { selectRiaTarifsSchema } from "@/zod-schemas/riaTarifs";
import { eq, getTableColumns } from "drizzle-orm";

export const getIncendieQuantite = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select()
      .from(incendieQuantites)
      .where(eq(incendieQuantites.surface, roundedSurface));
    if (results.length === 0) return null;
    return selectIncendieQuantitesSchema.parse(results[0]);
  } catch (err) {
    errorHelper(err);
  }
};

export const getIncendieTarifs = async (surface: string) => {
  const roundedSurface = roundSurface(parseInt(surface));
  try {
    const results = await db
      .select({
        ...getTableColumns(incendieTarifs),
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
      .from(incendieTarifs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, incendieTarifs.fournisseurId)
      )
      .where(eq(incendieTarifs.surface, roundedSurface));
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

export const getExutoiresTarifs = async () => {
  try {
    const results = await db.select().from(exutoiresTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectExutoiresTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParExutoire: result.prixParExutoire / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};
export const getExutoiresParkingsTarifs = async () => {
  try {
    const results = await db.select().from(exutoiresParkingTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectExutoiresTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParExutoire: result.prixParExutoire / RATIO,
      fraisDeplacement: result.fraisDeplacement / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getAlarmesTarifs = async () => {
  try {
    const results = await db.select().from(alarmesTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectAlarmesTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParControle: result.prixParControle / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getRiaTarifs = async () => {
  try {
    const results = await db.select().from(riaTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectRiaTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParRIA: result.prixParRIA / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getColonnesSechesTarifs = async () => {
  try {
    const results = await db.select().from(colonnesSechesTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectColonnesSechesTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParColonne: result.prixParColonne / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getPortesCoupeFeuTarifs = async () => {
  try {
    const results = await db.select().from(portesCoupeFeuTarifs);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectPortesCoupeFeuTarifsSchema.parse(result)
    );
    return validatedResults.map((result) => ({
      ...result,
      prixParPorte: result.prixParPorte / RATIO,
    }));
  } catch (err) {
    errorHelper(err);
  }
};
