import { db } from "@/db";
import { devis } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { SelectDevisType, selectDevisSchema } from "@/zod-schemas/devis";
import { eq } from "drizzle-orm";

export const getDevisById = async (
  devisId: number,
): Promise<SelectDevisType | null> => {
  try {
    const result = await db
      .select()
      .from(devis)
      .where(eq(devis.id, devisId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    const parsedResult = selectDevisSchema.parse(result[0]);
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return null;
  }
};
