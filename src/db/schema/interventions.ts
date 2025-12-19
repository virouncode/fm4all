import {
  interventionStatusCodes,
  interventionTypeCodes,
} from "@/constants/codeTables";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../schema";
import { createdAt, updatedAt } from "../schema-helper";
import { clients } from "./clients";
import { fournisseurs } from "./fournisseurs";
import { sites } from "./sites";
import { tickets } from "./tickets";

export const interventionStatusEnum = pgEnum(
  "intervention_status",
  interventionStatusCodes,
);

export const interventionTypeEnum = pgEnum(
  "intervention_type",
  interventionTypeCodes,
);

export const interventions = pgTable(
  "interventions",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id, { onDelete: "restrict" }),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id, {
        onDelete: "set null",
      }),
    type: interventionTypeEnum("type").notNull(),
    status: interventionStatusEnum("status")
      .notNull()
      .default("en_attente_confirmation"),
    confirmeeClient: boolean("confirmee_client").notNull().default(false),
    confirmeeFournisseur: boolean("confirmee_fournisseur")
      .notNull()
      .default(false),
    clientConfirmedAt: timestamp("client_confirmed_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    fournisseurConfirmedAt: timestamp("fournisseur_confirmed_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateDebutPrevue: timestamp("date_debut_prevue", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateFinPrevue: timestamp("date_fin_prevue", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateDebutReelle: timestamp("date_debut_reelle", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateFinReelle: timestamp("date_fin_reelle", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    titre: varchar("titre").notNull(),
    description: varchar("description"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("interventions_client_id_idx").on(table.clientId),
    index("interventions_site_id_idx").on(table.siteId),
    index("interventions_fournisseur_id_idx").on(table.fournisseurId),
    index("interventions_ticket_id_idx").on(table.ticketId),
    index("interventions_status_idx").on(table.status),
    index("interventions_date_debut_prevue_idx").on(table.dateDebutPrevue),
  ],
);
