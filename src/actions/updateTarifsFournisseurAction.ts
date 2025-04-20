"use server";

import { db } from "@/db";
import { nettoyageTarifs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { errorHelper } from "@/lib/errorHelper";
import { eq } from "drizzle-orm";

export interface Tarif {
  id: number;
  fournisseurId: number;
  surface: number;
  hParPassage: number;
  tauxHoraire: number;
  gamme: "essentiel" | "confort" | "excellence";
  createdAt: Date;
}

export async function updateTarifAction(
  id: number,
  field: keyof Tarif,
  value: number
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    const user = session?.user;
    const fournisseurId = user?.fournisseurId;

    if (!fournisseurId) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ces tarifs",
      };
    }

    // Check if the tarif belongs to the fournisseur
    const tarif = await db
      .select()
      .from(nettoyageTarifs)
      .where(
        eq(nettoyageTarifs.id, id) &&
          eq(nettoyageTarifs.fournisseurId, fournisseurId)
      )
      .limit(1);

    if (tarif.length === 0) {
      return {
        success: false,
        message:
          "Ce tarif n'existe pas ou vous n'êtes pas autorisé à le modifier",
      };
    }

    let valueToStore = value;
    if (field === "hParPassage" || field === "tauxHoraire") {
      valueToStore = value;
    }
    await db
      .update(nettoyageTarifs)
      .set({ [field]: valueToStore })
      .where(eq(nettoyageTarifs.id, id));

    return {
      success: true,
      message: "Tarif mis à jour avec succès",
    };
  } catch (err) {
    errorHelper(err);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du tarif",
    };
  }
}
