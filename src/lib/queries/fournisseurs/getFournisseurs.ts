import { db } from "@/db";
import { fournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { eq } from "drizzle-orm";

export const getFournisseurs = async () => {
  try {
    const results = await db
      .select()
      .from(fournisseurs)
      .orderBy(fournisseurs.nomFournisseur);
    return results;
  } catch (err) {
    errorHelper(err);
  }
};

export const getFournisseur = async (fournisseurId: number) => {
  try {
    const result = await db
      .select()
      .from(fournisseurs)
      .where(eq(fournisseurs.id, fournisseurId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    errorHelper(err);
  }
};
