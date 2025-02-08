import { db } from "@/db";
import { clients } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { and, eq } from "drizzle-orm";

export const getClientsWithEmailAndNomContact = async (
  emailContact: string,
  nomContact: string
) => {
  try {
    const result = await db.$count(
      clients,
      and(
        eq(clients.emailContact, emailContact),
        eq(clients.nomContact, nomContact)
      )
    );
    return result;
  } catch (err) {
    errorHelper(err);
  }
};
