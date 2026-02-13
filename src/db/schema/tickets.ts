import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { clientServiceOccurrences, occurrenceTaches } from "./services";

import {
  createdAt,
  createdById,
  id,
  timestamptz,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { entreprises } from "./entreprises";
import {
  ticketMessageVisibiliteEnum,
  ticketPrioriteEnum,
  ticketStatutEnum,
  ticketTypeEnum,
} from "./enums";
import { sites } from "./sites";

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    occurenceId: uuid("occurence_id").references(
      () => clientServiceOccurrences.id,
      {
        onDelete: "set null",
      },
    ),
    occurenceTacheId: uuid("occurence_tache_id").references(
      () => occurrenceTaches.id,
      {
        onDelete: "set null",
      },
    ),
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    demandeurEntrepriseId: uuid("demandeur_entreprise_id").references(
      () => entreprises.id,
      {
        onDelete: "set null",
      },
    ),
    assigneEntrepriseId: uuid("assigne_entreprise_id").references(
      () => entreprises.id,
      {
        onDelete: "set null",
      },
    ),
    assigneUserId: uuid("assigne_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "restrict" }),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    type: ticketTypeEnum("type").notNull(),
    priorite: ticketPrioriteEnum("priorite").notNull().default("normale"),
    statut: ticketStatutEnum("statut").notNull().default("nouveau"),
    lastActivityAt: timestamptz("last_activity_at").notNull().defaultNow(),
    resolvedAt: timestamptz("resolved_at"),
    closedAt: timestamptz("closed_at"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("tickets_proprietaire_idx").on(t.proprietaireEntrepriseId),
    index("tickets_demandeur_idx").on(t.demandeurEntrepriseId),
    index("tickets_assigne_entreprise_idx").on(t.assigneEntrepriseId),
    index("tickets_occurence_idx").on(t.occurenceId),
    index("tickets_occurence_tache_idx").on(t.occurenceTacheId),
    index("tickets_statut_idx").on(t.statut),
    index("tickets_priorite_idx").on(t.priorite),
    index("tickets_type_idx").on(t.type),
    index("tickets_assigne_user_idx").on(t.assigneUserId),
    index("tickets_last_activity_idx").on(t.lastActivityAt),
    index("tickets_created_at_idx").on(t.createdAt),
  ],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: id(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    auteurUserId: uuid("auteur_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    message: text("message").notNull(),
    visibilite: ticketMessageVisibiliteEnum("visibilite")
      .notNull()
      .default("public"),
    createdAt: createdAt(),
  },
  (t) => [
    index("ticket_messages_ticket_idx").on(t.ticketId),
    index("ticket_messages_ticket_created_at_idx").on(t.ticketId, t.createdAt),
    index("ticket_messages_auteur_idx").on(t.auteurUserId),
    index("ticket_messages_visibilite_idx").on(t.visibilite),
  ],
);
