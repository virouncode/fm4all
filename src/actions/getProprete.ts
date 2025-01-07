"use server";

import { db } from "@/db";
import {
  fournisseurs,
  propreteConsoTarifs,
  propreteDistribQuantites,
  propreteDistribTarifs,
  propreteInstalDistribTarifs,
} from "@/db/schema";
import { selectPropreteConsoTarifsSchema } from "@/zod-schemas/propreteConsoTarifs";
import { selectPropreteDistribQuantiteSchema } from "@/zod-schemas/propreteDistribQuantite";
import { selectPropreteDistribTarifsSchema } from "@/zod-schemas/propreteDistribTarifs";
import { selectPropreteInstalDistribTarifsSchema } from "@/zod-schemas/propreteInstalDistribTarifs";
import { and, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const getPropreteDistribQuantites = async (effectif: number) => {
  try {
    const results = await db
      .select()
      .from(propreteDistribQuantites)
      .where(eq(propreteDistribQuantites.effectif, effectif));

    if (results.length === 0) {
      return null;
    }
    const distribQuantites = selectPropreteDistribQuantiteSchema.parse(
      results[0]
    );
    return {
      ...distribQuantites,
      nbDistribDesinfectant: distribQuantites.nbDistribPh,
      nbDistribParfum: distribQuantites.nbDistribEmp,
      nbDistribBalai: distribQuantites.nbDistribPh,
      nbDistribPoubelle: Math.ceil(distribQuantites?.nbDistribPh / 2),
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des quantités de distributeurs propreté : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des quantités de distributeurs propreté : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des quantités de distributeurs propreté : erreur inconnue."
      );
    }
  }
};

export const getPropreteDistribTarifs = async (fournisseurId: number) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(propreteDistribTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(propreteDistribTarifs)
      .innerJoin(
        fournisseurs,
        eq(propreteDistribTarifs.fournisseurId, fournisseurs.id)
      )
      .where(eq(propreteDistribTarifs.fournisseurId, fournisseurId));

    if (results.length === 0) {
      return [];
    }
    return results.map((result) =>
      selectPropreteDistribTarifsSchema.parse(result)
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des tarifs de distributeurs propreté : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des tarifs de distributeurs propreté : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des tarifs de distributeurs propreté : erreur inconnue."
      );
    }
  }
};

export const getPropreteInstalDistribTarifs = async (
  effectif: number,
  fournisseurId: number
) => {
  try {
    const results = await db
      .select()
      .from(propreteInstalDistribTarifs)
      .where(
        and(
          eq(propreteInstalDistribTarifs.effectif, effectif),
          eq(propreteInstalDistribTarifs.fournisseurId, fournisseurId)
        )
      );

    if (results.length === 0) {
      return [];
    }
    return results.map((result) =>
      selectPropreteInstalDistribTarifsSchema.parse(result)
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des tarifs d'installation distributeurs propreté : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des tarifs d'installation distributeurs propreté : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des tarifs d'installation distributeurs propreté : erreur inconnue."
      );
    }
  }
};

export const getPropreteConsoTarifs = async (
  effectif: number,
  fournisseurId: number
) => {
  try {
    const results = await db
      .select({
        ...getTableColumns(propreteConsoTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(propreteConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(propreteConsoTarifs.fournisseurId, fournisseurs.id)
      )
      .where(
        and(
          eq(propreteConsoTarifs.effectif, effectif),
          eq(propreteConsoTarifs.fournisseurId, fournisseurId)
        )
      );

    if (results.length === 0) {
      return [];
    }
    return results.map((result) =>
      selectPropreteConsoTarifsSchema.parse(result)
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des tarifs de consommables propreté : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des tarifs de consommables propreté : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des tarifs de consommables propreté : erreur inconnue."
      );
    }
  }
};
