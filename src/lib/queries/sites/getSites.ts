import { db } from "@/db";
import { sites } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectSiteSchema } from "@/zod-schemas/site";

export const getSites = async () => {
  try {
    const results = await db.select().from(sites).orderBy(sites.nomSite);
    const parsedResults = results.map((s) => selectSiteSchema.parse(s));
    return parsedResults;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};
