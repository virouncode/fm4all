import { db } from "@/db";
import { clientFournisseurs, clients, fournisseurs, sites } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectClientSchema } from "@/zod-schemas/client";
import { selectFournisseurSchema } from "@/zod-schemas/fournisseur";
import { selectSiteSchema } from "@/zod-schemas/site";
import { and, eq } from "drizzle-orm";

export const getClientsWithEmailAndNomContact = async (
  emailContact: string,
  nomContact: string,
) => {
  try {
    const result = await db.$count(
      clients,
      and(
        eq(clients.emailContact, emailContact),
        eq(clients.nomContact, nomContact),
      ),
    );
    return result;
  } catch (err) {
    errorHelper(err);
  }
};

export const getClients = async () => {
  try {
    const results = await db
      .select()
      .from(clients)
      .orderBy(clients.nomEntreprise);
    const parsedResults = results.map((c) => selectClientSchema.parse(c));
    return parsedResults;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getClientSites = async (clientId: number) => {
  try {
    const results = await db
      .select()
      .from(sites)
      .where(eq(sites.clientId, clientId))
      .orderBy(sites.nomSite);
    const parsedResult = results.map((s) => selectSiteSchema.parse(s));
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getClientFournisseurs = async (clientId: number) => {
  try {
    const results = await db
      .select({
        fournisseur: fournisseurs,
      })
      .from(clientFournisseurs)
      .innerJoin(
        fournisseurs,
        eq(fournisseurs.id, clientFournisseurs.fournisseurId),
      )
      .where(eq(clientFournisseurs.clientId, clientId));
    const parsedResult = results.map((r) =>
      selectFournisseurSchema.parse(r.fournisseur),
    );
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};
