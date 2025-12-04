import { db } from "@/db";
import {
  clientFournisseurs,
  clients,
  devis,
  fournisseurs,
  sites,
  user,
} from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import {
  dateToUtcStartOfDay,
  dateToUtcStartOfNextDay,
} from "@/lib/utils/formatDates";
import { selectClientSchema, SelectClientType } from "@/zod-schemas/client";
import {
  DevisQueryBackendType,
  selectDevisSchema,
  SelectDevisType,
  SORTABLE_DEVIS_COLUMNS,
} from "@/zod-schemas/devis";
import {
  selectFournisseurSchema,
  SelectFournisseurType,
} from "@/zod-schemas/fournisseur";
import {
  selectSiteSchema,
  SelectSiteType,
  SitesQueryBackendType,
  SORTABLE_SITES_COLUMNS,
} from "@/zod-schemas/site";
import {
  ClientUsersQueryBackendType,
  selectUserSchema,
  SelectUserType,
  SORTABLE_CLIENT_USERS_COLUMNS,
} from "@/zod-schemas/user";
import { and, asc, desc, eq, gte, ilike, lt, SQL } from "drizzle-orm";

export const getClients = async (): Promise<SelectClientType[]> => {
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
}): Promise<SelectSiteType[]> => {
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

export const getClientFournisseurs = async (
  clientId: number,
): Promise<SelectFournisseurType[]> => {
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

export const getClientSiteById = async (
  siteId: number,
): Promise<SelectSiteType | null> => {
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

export const getClientUsers = async (params: {
  clientId: number;
  query: ClientUsersQueryBackendType;
}): Promise<SelectUserType[]> => {
  try {
    const { lastName, firstName, email, orderBy, orderDir } = params.query;

    const whereClauses: SQL[] = [];
    whereClauses.push(eq(user.clientId, params.clientId));

    if (lastName) whereClauses.push(ilike(user.lastName, `%${lastName}%`));
    if (firstName) whereClauses.push(ilike(user.firstName, `%${firstName}%`));
    if (email) whereClauses.push(ilike(user.email, `%${email}%`));

    const orderColumn =
      SORTABLE_CLIENT_USERS_COLUMNS[orderBy] ??
      SORTABLE_CLIENT_USERS_COLUMNS.lastName;

    const orderDirection = orderDir === "asc" ? asc : desc;
    const orderExpr = orderDirection(orderColumn);

    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    const result = await db.select().from(user).where(where).orderBy(orderExpr);
    const parsedResult = result.map((u) => selectUserSchema.parse(u));
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getClientDevis = async (params: {
  clientId: number;
  query: DevisQueryBackendType;
}): Promise<SelectDevisType[]> => {
  const { clientId } = params;
  const {
    fournisseurId,
    siteId,
    titre,
    typePrix,
    status,
    createdFrom,
    createdTo,
    validFrom,
    validTo,
    orderBy,
    orderDir,
  } = params.query;

  const whereClauses: SQL[] = [];
  whereClauses.push(eq(devis.clientId, clientId));

  if (titre) whereClauses.push(ilike(devis.titre, `%${titre}%`));
  if (status) whereClauses.push(eq(devis.status, status));
  if (fournisseurId) whereClauses.push(eq(devis.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(devis.siteId, siteId));
  if (typePrix) whereClauses.push(eq(devis.typePrix, typePrix));

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom); // Date
    if (createdFromDate) {
      whereClauses.push(gte(devis.createdAt, createdFromDate));
    }
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo); // Date
    if (createdToDate) {
      whereClauses.push(lt(devis.createdAt, createdToDate));
    }
  }

  if (validFrom) {
    const validFromDate = dateToUtcStartOfDay(validFrom); // Date
    if (validFromDate) {
      whereClauses.push(gte(devis.dateValidite, validFromDate));
    }
  }

  if (validTo) {
    const validToDate = dateToUtcStartOfNextDay(validTo); // Date
    if (validToDate) {
      whereClauses.push(lt(devis.dateValidite, validToDate));
    }
  }
  const orderColumn =
    SORTABLE_DEVIS_COLUMNS[orderBy] ?? SORTABLE_DEVIS_COLUMNS.createdAt;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  try {
    const results = await db
      .select()
      .from(devis)
      .where(where)
      .orderBy(orderExpr);
    const parsedResult = results.map((s) => selectDevisSchema.parse(s));
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};
