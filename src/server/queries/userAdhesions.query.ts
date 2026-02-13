import "server-only";
import { db } from "@/db";
import { userAdhesions } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

const selectUserAdhesionSchema = createSelectSchema(userAdhesions);

export async function getUserAdhesion({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}) {
  const [row] = await db
    .select()
    .from(userAdhesions)
    .where(
      and(
        eq(userAdhesions.userId, userId),
        eq(userAdhesions.entrepriseId, entrepriseId),
      ),
    )
    .limit(1);

  if (!row) return null;
  return selectUserAdhesionSchema.parse(row);
}
