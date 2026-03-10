import "server-only";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documents } from "@/db/schema/documents";
import { userClientAdhesions, userPlateformeAdhesions, userPrestataireAdhesions, usersArborescence } from "@/db/schema/users";
import {
  selectUserSchema,
  userWithAdhesionSchema,
  type UsersQueryBackendType,
} from "@/zod-schemas/user.schema";
import { and, asc, desc, eq, ilike, notExists, or, sql, SQL } from "drizzle-orm";
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
 * GET: All users for a prestataire entreprise (via userPrestataireAdhesions).
 * À utiliser quand la posture est "prestataire" — getUsersByEntrepriseId ne retourne
 * que les utilisateurs clients (innerJoin userClientAdhesions).
 */
export async function getUsersByPrestataireEntrepriseId(entrepriseId: string) {
  const rows = await db
    .select({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
    })
    .from(user)
    .innerJoin(userPrestataireAdhesions, eq(user.id, userPrestataireAdhesions.userId))
    .where(eq(userPrestataireAdhesions.entrepriseId, entrepriseId));
  return rows;
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
 * CHECK: User belongs to entreprise (via any adhesion — client OR prestataire)
 */
export async function userBelongsToEntreprise({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const [[clientRow], [prestataireRow]] = await Promise.all([
    db
      .select({ id: userClientAdhesions.userId })
      .from(userClientAdhesions)
      .where(
        and(
          eq(userClientAdhesions.userId, userId),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
        ),
      )
      .limit(1),
    db
      .select({ id: userPrestataireAdhesions.userId })
      .from(userPrestataireAdhesions)
      .where(
        and(
          eq(userPrestataireAdhesions.userId, userId),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        ),
      )
      .limit(1),
  ]);

  return !!clientRow || !!prestataireRow;
}

/**
 * GET: Users already in the enterprise (arborescence) who don't yet have the target posture adhesion
 * Used to populate the "Rattacher un utilisateur existant" picker
 */
export async function getUsersEligibleForAdhesion({
  entrepriseId,
  posture,
}: {
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
}) {
  // Base: users who appear in this enterprise's arborescence (self-referential entry, profondeur=0)
  const baseQuery = db
    .select({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
    })
    .from(user)
    .innerJoin(
      usersArborescence,
      and(
        eq(usersArborescence.descendantId, user.id),
        eq(usersArborescence.ancetreId, user.id), // self-referential = profondeur 0
        eq(usersArborescence.entrepriseId, entrepriseId),
      ),
    );

  if (posture === "client") {
    return baseQuery
      .where(
        notExists(
          db
            .select()
            .from(userClientAdhesions)
            .where(
              and(
                eq(userClientAdhesions.userId, user.id),
                eq(userClientAdhesions.entrepriseId, entrepriseId),
              ),
            ),
        ),
      )
      .orderBy(asc(user.nom));
  }

  if (posture === "prestataire") {
    return baseQuery
      .where(
        notExists(
          db
            .select()
            .from(userPrestataireAdhesions)
            .where(
              and(
                eq(userPrestataireAdhesions.userId, user.id),
                eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
              ),
            ),
        ),
      )
      .orderBy(asc(user.nom));
  }

  // plateforme
  return baseQuery
    .where(
      notExists(
        db
          .select()
          .from(userPlateformeAdhesions)
          .where(eq(userPlateformeAdhesions.userId, user.id)),
      ),
    )
    .orderBy(asc(user.nom));
}

/**
 * QUERY: Users with filters, sorting, pagination (posture-aware)
 */
export async function getUsers(query: UsersQueryBackendType) {
  const {
    posture = "client",
    entrepriseId,
    search,
    roleAdhesion,
    statutAdhesion,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = query;

  // Shared: search conditions
  const buildSearchClauses = (): SQL[] => {
    if (!search?.trim()) return [];
    const searchTerms = search.trim().toLowerCase().split(/\s+/);
    return searchTerms.map((term) => {
      const likeTerm = `%${term}%`;
      return and(
        or(
          ilike(user.prenom, likeTerm),
          ilike(user.nom, likeTerm),
          ilike(user.email, likeTerm),
        ),
      )!;
    });
  };

  // Shared: order + pagination
  const orderColumn = {
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    createdAt: user.createdAt,
  }[orderBy];
  const orderExpr = orderDir === "asc" ? asc(orderColumn) : desc(orderColumn);
  const offset = (page - 1) * pageSize;

  // ── POSTURE PLATEFORME ──────────────────────────────────────────────────────
  if (posture === "plateforme") {
    const whereClauses: SQL[] = [...buildSearchClauses()];
    if (statutAdhesion) {
      whereClauses.push(eq(userPlateformeAdhesions.statut, statutAdhesion));
    }
    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    const rows = await db
      .select({
        user: user,
        plateformeAdhesion: {
          role: userPlateformeAdhesions.role,
          statut: userPlateformeAdhesions.statut,
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
      .innerJoin(userPlateformeAdhesions, eq(user.id, userPlateformeAdhesions.userId))
      .leftJoin(documents, eq(user.avatarId, documents.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(pageSize + 1)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .innerJoin(userPlateformeAdhesions, eq(user.id, userPlateformeAdhesions.userId))
      .where(where);

    const hasMore = rows.length > pageSize;
    const items = rows.slice(0, pageSize);
    const total = countResult?.count ?? 0;

    return {
      items: z
        .array(userWithAdhesionSchema)
        .parse(
          items.map((r) => ({
            ...r.user,
            adhesion: null,
            plateformeAdhesion: r.plateformeAdhesion,
            avatar: r.avatar,
          })),
        ),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    };
  }

  // ── POSTURE PRESTATAIRE ─────────────────────────────────────────────────────
  if (posture === "prestataire") {
    const whereClauses: SQL[] = [
      eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
      ...buildSearchClauses(),
    ];
    if (roleAdhesion) {
      whereClauses.push(sql`${userPrestataireAdhesions.role} = ${roleAdhesion}`);
    }
    if (statutAdhesion) {
      whereClauses.push(eq(userPrestataireAdhesions.statut, statutAdhesion));
    }
    const where = and(...whereClauses);

    const rows = await db
      .select({
        user: user,
        adhesion: {
          role: userPrestataireAdhesions.role,
          statut: userPrestataireAdhesions.statut,
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
      .innerJoin(userPrestataireAdhesions, eq(user.id, userPrestataireAdhesions.userId))
      .leftJoin(userPlateformeAdhesions, eq(user.id, userPlateformeAdhesions.userId))
      .leftJoin(documents, eq(user.avatarId, documents.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(pageSize + 1)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .innerJoin(userPrestataireAdhesions, eq(user.id, userPrestataireAdhesions.userId))
      .where(where);

    const hasMore = rows.length > pageSize;
    const items = rows.slice(0, pageSize);
    const total = countResult?.count ?? 0;

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
      totalPages: Math.ceil(total / pageSize),
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    };
  }

  // ── POSTURE CLIENT (default) ─────────────────────────────────────────────────
  const whereClauses: SQL[] = [
    eq(userClientAdhesions.entrepriseId, entrepriseId),
    ...buildSearchClauses(),
  ];
  if (roleAdhesion) {
    whereClauses.push(eq(userClientAdhesions.role, roleAdhesion));
  }
  if (statutAdhesion) {
    whereClauses.push(eq(userClientAdhesions.statut, statutAdhesion));
  }
  const where = and(...whereClauses);

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

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .innerJoin(userClientAdhesions, eq(user.id, userClientAdhesions.userId))
    .where(where);

  const total = countResult?.count ?? 0;

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
    totalPages: Math.ceil(total / pageSize),
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };
}
