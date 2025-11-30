import { db } from "@/db";
import { clientFournisseurs, clients, fournisseurs, sites } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectClientSchema } from "@/zod-schemas/client";
import { selectFournisseurSchema } from "@/zod-schemas/fournisseur";
import {
  selectSiteSchema,
  SitesQueryBackendType,
  SORTABLE_SITES_COLUMNS,
} from "@/zod-schemas/site";
import { and, asc, desc, eq, ilike, SQL } from "drizzle-orm";

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

export const getClientSites = async (params: {
  clientId: number;
  query: SitesQueryBackendType;
}) => {
  const { clientId } = params;
  const {
    nomSite,
    codePostal,
    ville,
    typeBatiment,
    typeOccupation,
    orderBy,
    orderDir,
  } = params.query;

  console.log("getClientSites params:", params);

  const whereClauses: SQL[] = [];
  whereClauses.push(eq(sites.clientId, clientId));

  if (nomSite) whereClauses.push(ilike(sites.nomSite, `%${nomSite}%`));
  if (codePostal) whereClauses.push(eq(sites.codePostal, codePostal));
  if (ville) whereClauses.push(ilike(sites.ville, `%${ville}%`));
  if (typeBatiment) whereClauses.push(eq(sites.typeBatiment, typeBatiment));
  if (typeOccupation)
    whereClauses.push(eq(sites.typeOccupation, typeOccupation));

  const orderColumn =
    SORTABLE_SITES_COLUMNS[orderBy] ?? SORTABLE_SITES_COLUMNS.nomSite;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  try {
    const results = await db
      .select()
      .from(sites)
      .where(where)
      .orderBy(orderExpr);
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

export const getClientSiteById = async (siteId: number) => {
  try {
    const result = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    const parsedResult = selectSiteSchema.parse(result[0]);
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return null;
  }
};
