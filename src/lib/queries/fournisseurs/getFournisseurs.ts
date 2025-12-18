import { db } from "@/db";
import { fournisseurs } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import {
  AdminFournisseursQueryBackendType,
  selectFournisseurSchema,
  SORTABLE_ADMIN_FOURNISSEURS_COLUMNS,
} from "@/zod-schemas/fournisseur";
import { and, asc, count, desc, eq, ilike, SQL } from "drizzle-orm";

export const getFournisseurs = async () => {
  try {
    const results = await db
      .select()
      .from(fournisseurs)
      .orderBy(fournisseurs.nomFournisseur);
    const parsedResults = results.map((f) => selectFournisseurSchema.parse(f));
    return parsedResults;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getFournisseur = async (fournisseurId: number) => {
  try {
    const result = await db
      .select()
      .from(fournisseurs)
      .where(eq(fournisseurs.id, fournisseurId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    errorHelper(err);
  }
};

//============== ADMIN ==================//

export const getAllFournisseursWithPagination = async ({
  query,
}: {
  query: AdminFournisseursQueryBackendType;
}) => {
  try {
    const {
      nomFournisseur,
      siret,
      emailContact,
      phoneContact,
      orderBy,
      orderDir,
      page,
      pageSize,
    } = query;

    // Build WHERE conditions
    const conditions: SQL[] = [];

    if (nomFournisseur) {
      conditions.push(eq(fournisseurs.nomFournisseur, nomFournisseur));
    }
    if (siret) {
      conditions.push(ilike(fournisseurs.siret, `%${siret}%`));
    }
    if (emailContact) {
      conditions.push(ilike(fournisseurs.emailContact, `%${emailContact}%`));
    }
    if (phoneContact) {
      conditions.push(ilike(fournisseurs.phoneContact, `%${phoneContact}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [totalResult] = await db
      .select({ count: count() })
      .from(fournisseurs)
      .where(whereClause);
    const total = totalResult?.count ?? 0;

    // Build ORDER BY
    const sortColumn = SORTABLE_ADMIN_FOURNISSEURS_COLUMNS[orderBy];
    const orderFn = orderDir === "asc" ? asc : desc;

    // Paginated query
    const offset = (page - 1) * pageSize;
    const items = await db
      .select()
      .from(fournisseurs)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    const hasMore = offset + items.length < total;

    return { items, total, page, pageSize, hasMore };
  } catch (err) {
    errorHelper(err);
    return { items: [], total: 0, page: 1, pageSize: 25, hasMore: false };
  }
};

// Récupérer les services d'un fournisseur (ids uniquement)
import { servicesFournisseurs } from "@/db/schema";

export const getFournisseurServices = async (
  fournisseurId: number,
): Promise<number[]> => {
  try {
    const results = await db
      .select({ serviceId: servicesFournisseurs.serviceId })
      .from(servicesFournisseurs)
      .where(eq(servicesFournisseurs.fournisseurId, fournisseurId));
    return results.map((r) => r.serviceId);
  } catch (err) {
    errorHelper(err);
    return [];
  }
};
