import { db } from "@/db";
import { user } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectUserSchema } from "@/zod-schemas/user";
import { eq } from "drizzle-orm";

export const getUserById = async (userId: string) => {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    const parsedResult = result.map((r) => selectUserSchema.parse(r))[0];
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return null;
  }
};
