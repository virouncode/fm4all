import "server-only";
import { db } from "@/db";
import { userClientAdhesions } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

const selectUserClientAdhesionSchema = createSelectSchema(userClientAdhesions);

export async function getUserClientAdhesion({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}) {
  const [row] = await db
    .select()
    .from(userClientAdhesions)
    .where(
      and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
      ),
    )
    .limit(1);

  if (!row) return null;
  return selectUserClientAdhesionSchema.parse(row);
}
