import "server-only";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documents } from "@/db/schema/documents";
import { userClientAdhesions, userPlateformeAdhesions } from "@/db/schema/users";
import {
  selectUserSchema,
  userWithAdhesionSchema,
  type UsersQueryBackendType,
} from "@/zod-schemas/user.schema";
import { and, asc, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import { z } from "zod";

/**
 * GET: All users for an entreprise with hierarchy
 */
export async function getUsersByEntrepriseId(entrepriseId: string) {
  const rows = await db
    .select({
      user: user,
      adhesion: {
        role: userClientAdhesions.role,
        statut: userClientAdhesions.statut,
      },
      plateformeAdhesion: {
        role: userPlateformeAdhesions.role,
      },
      avatar: {
        storageKey: documents.storageKey,
        storageProvider: documents.storageProvider,
        filename: documents.filename,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
      },
    })
    .from(user)
    .innerJoin(userClientAdhesions, eq(user.id, userClientAdhesions.userId))
    .leftJoin(userPlateformeAdhesions, eq(user.id, userPlateformeAdhesions.userId))
    .leftJoin(documents, eq(user.avatarId, documents.id))
    .where(eq(userClientAdhesions.entrepriseId, entrepriseId));

  return z
    .array(userWithAdhesionSchema)
    .parse(
      rows.map((r) => ({
        ...r.user,
        adhesion: r.adhesion,
        plateformeAdhesion: r.plateformeAdhesion?.role ? r.plateformeAdhesion : null,
        avatar: r.avatar,
      })),
    );
}

/**
 * GET: Single user by ID
 */
export async function getUserById(userId: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!row) return null;
  return selectUserSchema.parse(row);
}

/**
 * CHECK: User belongs to entreprise (via adhesion)
 */
export async function userBelongsToEntreprise({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<boolean> {
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

  return !!row;
}

/**
 * QUERY: Users with filters, sorting, pagination
 */
export async function getUsers(query: UsersQueryBackendType) {
  const {
    entrepriseId,
    search,
    roleAdhesion,
    statutAdhesion,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = query;

  const whereClauses: SQL[] = [eq(userClientAdhesions.entrepriseId, entrepriseId)];

  // Filter: Search (case-insensitive, prenom/nom/email in any order)
  if (search && search.trim()) {
    const searchTerms = search.trim().toLowerCase().split(/\s+/);
    const searchConditions = searchTerms.map((term) => {
      const likeTerm = `%${term}%`;
      return or(
        ilike(user.prenom, likeTerm),
        ilike(user.nom, likeTerm),
        ilike(user.email, likeTerm),
      );
    });
    whereClauses.push(and(...searchConditions)!);
  }

  // Filter: Role adhesion
  if (roleAdhesion) {
    whereClauses.push(eq(userClientAdhesions.role, roleAdhesion));
  }

  // Filter: Statut adhesion
  if (statutAdhesion) {
    whereClauses.push(eq(userClientAdhesions.statut, statutAdhesion));
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  // Order by
  const orderColumn = {
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    createdAt: user.createdAt,
  }[orderBy];

  const orderExpr = orderDir === "asc" ? asc(orderColumn) : desc(orderColumn);

  // Pagination
  const offset = (page - 1) * pageSize;

  // Fetch data
  const rows = await db
    .select({
      user: user,
      adhesion: {
        role: userClientAdhesions.role,
        statut: userClientAdhesions.statut,
      },
      plateformeAdhesion: {
        role: userPlateformeAdhesions.role,
      },
      avatar: {
        storageKey: documents.storageKey,
        storageProvider: documents.storageProvider,
        filename: documents.filename,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
      },
    })
    .from(user)
    .innerJoin(userClientAdhesions, eq(user.id, userClientAdhesions.userId))
    .leftJoin(userPlateformeAdhesions, eq(user.id, userPlateformeAdhesions.userId))
    .leftJoin(documents, eq(user.avatarId, documents.id))
    .where(where)
    .orderBy(orderExpr)
    .limit(pageSize + 1)
    .offset(offset);

  const hasMore = rows.length > pageSize;
  const items = rows.slice(0, pageSize);

  // Count total
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .innerJoin(userClientAdhesions, eq(user.id, userClientAdhesions.userId))
    .where(where);

  const total = countResult?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    items: z
      .array(userWithAdhesionSchema)
      .parse(
        items.map((r) => ({
          ...r.user,
          adhesion: r.adhesion,
          plateformeAdhesion: r.plateformeAdhesion?.role ? r.plateformeAdhesion : null,
          avatar: r.avatar,
        })),
      ),
    page,
    pageSize,
    total,
    totalPages,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };
}
