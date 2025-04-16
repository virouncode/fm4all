import { db } from "@/db";
import { fournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";

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
