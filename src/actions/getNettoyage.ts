"use server";

import { db } from "@/db";
import {
  fournisseurs,
  nettoyageQuantites,
  nettoyageRepasseTarifs,
  nettoyageTarifs,
} from "@/db/schema";
import { selectNettoyageQuantitesSchema } from "@/zod-schemas/nettoyageQuantites";
import { selectNettoyageRepasseTarifsSchema } from "@/zod-schemas/nettoyageRepasse";
import { selectNettoyageTarifsSchema } from "@/zod-schemas/nettoyageTarifs";
import { eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const getNettoyageQuantites = async (surface: number) => {
  try {
    const results = await db
      .select()
      .from(nettoyageQuantites)
      .where(eq(nettoyageQuantites.surface, surface));
    if (results.length === 0) return [];
    return results.map((result) =>
      selectNettoyageQuantitesSchema.parse(result)
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des quantités de nettoyage : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des quantités de nettoyage : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des quantités de nettoyage : erreur inconnue."
      );
    }
  }
};

export const getNettoyageTarifs = async (surface: number) => {
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
      .where(eq(nettoyageTarifs.surface, surface));
    if (results.length === 0) return [];
    return results.map((result) => selectNettoyageTarifsSchema.parse(result));
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des tarifs de nettoyage : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des tarifs de nettoyage : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des tarifs de nettoyage : erreur inconnue."
      );
    }
  }
};

//freq_annuelle * hParPassage * tauxHoraire = prix_annuel
export const getNettoyagePropositions = async (surface: number) => {
  try {
    const [frequencesAnnuelles, tarifs] = await Promise.all([
      getNettoyageQuantites(surface),
      getNettoyageTarifs(surface),
    ]);

    const propositions = tarifs
      .map((tarif) => ({
        ...tarif,
        freqAnnuelle: frequencesAnnuelles.find(
          ({ gamme }) => gamme === tarif.gamme
        )?.freqAnnuelle as number,
        prixAnnuel: Math.round(
          ((frequencesAnnuelles.find(({ gamme }) => gamme === tarif.gamme)
            ?.freqAnnuelle as number) /
            10000) *
            (tarif.hParPassage / 10000) *
            (tarif.tauxHoraire / 10000)
        ),
        prixAnnuelSamedi: Math.round(
          52 * (tarif.hParPassage / 10000) * ((tarif.tauxHoraire * 1.2) / 10000)
        ),
        prixAnnuelDimanche: Math.round(
          52 *
            (tarif.hParPassage / 10000) *
            ((tarif.tauxHoraire * 1.25) / 10000)
        ),
      }))
      .sort((a, b) => a.fournisseurId - b.fournisseurId);
    return propositions;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des devis de nettoyage : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des devis de nettoyage : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des devis de nettoyage : erreur inconnue."
      );
    }
  }
};

export const getNettoyageRepasseTarifs = async (surface: number) => {
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
      .where(eq(nettoyageRepasseTarifs.surface, surface));
    if (result.length === 0) return [];
    return result.map((result) =>
      selectNettoyageRepasseTarifsSchema.parse(result)
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des tarifs de repasse sanitaire : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des tarifs de repasse sanitaire : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des tarifs de repasse sanitaire : erreur inconnue."
      );
    }
  }
};

export const getNettoyageRepassePropositions = async (surface: number) => {
  try {
    const [frequencesAnnuelles, tarifs] = await Promise.all([
      getNettoyageQuantites(surface),
      getNettoyageRepasseTarifs(surface),
    ]);
    const propositions = tarifs
      .map((tarif) => ({
        ...tarif,
        freqAnnuelle: frequencesAnnuelles.find(
          ({ gamme }) => gamme === tarif.gamme
        )?.freqAnnuelle as number,
        prixAnnuel: Math.round(
          ((frequencesAnnuelles.find(({ gamme }) => gamme === tarif.gamme)
            ?.freqAnnuelle as number) /
            10000) *
            (tarif.hParPassage / 10000) *
            (tarif.tauxHoraire / 10000)
        ),
      }))
      .sort((a, b) => a.fournisseurId - b.fournisseurId);
    return propositions;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `${issue.path[0]} : ${issue.message}`)
        .join(", ");
      console.error(`Erreurs de validation du schéma : ${messages}`);
      throw new Error(
        "Échec de la récupération des devis de repasse sanitaire : le schéma est invalide."
      );
    } else if (err instanceof Error) {
      console.error(`Erreur : ${err.message}`);
      throw new Error(
        `Échec de la récupération des devis de repasse sanitaire : ${err.message}`
      );
    } else {
      console.error("Erreur inconnue.");
      throw new Error(
        "Échec de la récupération des devis de repasse sanitaire : erreur inconnue."
      );
    }
  }
};
