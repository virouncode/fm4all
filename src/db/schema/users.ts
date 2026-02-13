import {
  index,
  pgTable,
  smallint,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./auth";
import { entreprises } from "./entreprises";
import {
  adhesionStatutEnum,
  attributionModeEnum,
  roleAdhesionEnum,
  roleAttributionSiteEnum,
  rolePlateformeAdhesionEnum,
  siteAttributionScopeEnum,
} from "./enums";
import { sites } from "./sites";

export const usersArborescence = pgTable(
  "users_arborescence",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    ancetreId: uuid("ancetre_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    descendantId: uuid("descendant_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    profondeur: smallint("profondeur").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: uuid("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: uuid("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("users_arborescence_entreprise_id_idx").on(table.entrepriseId),
    index("users_arborescence_ancetre_id_idx").on(table.ancetreId),
    index("users_arborescence_descendant_id_idx").on(table.descendantId),
    uniqueIndex("users_arborescence_entreprise_anc_desc_udx").on(
      table.entrepriseId,
      table.ancetreId,
      table.descendantId,
    ),
  ],
);

export const userSiteAttributions = pgTable(
  "user_site_attributions",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, {
        onDelete: "cascade",
      }),
    mode: attributionModeEnum("mode").notNull().default("inclure"),
    scope: siteAttributionScopeEnum("scope").notNull().default("subtree"),
    role: roleAttributionSiteEnum("role").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: uuid("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: uuid("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("user_site_attributions_entreprise_id_idx").on(table.entrepriseId),
    index("user_site_attributions_user_id_idx").on(table.userId),
    index("user_site_attributions_site_id_idx").on(table.siteId),
    uniqueIndex("user_site_attributions_user_site_entreprise_udx").on(
      table.userId,
      table.siteId,
      table.entrepriseId,
    ),
  ],
);

export const userAdhesions = pgTable(
  "user_adhesions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    role: roleAdhesionEnum("role").notNull(),
    statut: adhesionStatutEnum("statut").notNull().default("actif"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (table) => [
    index("user_adhesions_user_id_idx").on(table.userId),
    index("user_adhesions_entreprise_id_idx").on(table.entrepriseId),
    index("user_adhesions_statut_idx").on(table.statut),
    uniqueIndex("user_adhesions_user_entreprise_udx").on(
      table.userId,
      table.entrepriseId,
    ),
  ],
);

/**
 * Adhésion "plateforme" (FM4ALL) : droits cross-entreprises.
 * 1 ligne max par utilisateur.
 */
export const userPlateformeAdhesions = pgTable(
  "user_plateforme_adhesions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    role: rolePlateformeAdhesionEnum("role").notNull(),
    statut: adhesionStatutEnum("statut").notNull().default("actif"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    // 1 adhésion plateforme max par user
    uniqueIndex("user_plateforme_adhesions_user_udx").on(t.userId),
    index("user_plateforme_adhesions_role_idx").on(t.role),
    index("user_plateforme_adhesions_statut_idx").on(t.statut),
  ],
);
