import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../schema";
import { createdAt, updatedAt } from "../schema-helper";
import {
  ticketCategorieEnum,
  ticketPrioriteEnum,
  ticketStatusEnum,
} from "./enums";

export const tickets = pgTable(
  "tickets",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    siteId: integer("site_id").notNull(),
    fournisseurId: integer("fournisseur_id"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    titre: varchar().notNull(),
    description: varchar(),
    categorie: ticketCategorieEnum("categorie").notNull(),
    priorite: ticketPrioriteEnum("priorite").notNull().default("normale"),
    status: ticketStatusEnum("status").notNull().default("nouveau"),
    dateCloture: timestamp("date_cloture", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tickets_client_id_idx").on(table.clientId),
    index("tickets_site_id_idx").on(table.siteId),
    index("tickets_fournisseur_id_idx").on(table.fournisseurId),
    index("tickets_created_by_user_id_idx").on(table.createdById),
    index("tickets_status_idx").on(table.status),
    index("tickets_priorite_idx").on(table.priorite),
    index("tickets_created_at_idx").on(table.createdAt),
    index("tickets_categorie_idx").on(table.categorie),
  ],
);

export const ticketsAttachments = pgTable(
  "tickets_attachments",
  {
    id: serial().primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    uploadedById: text("uploaded_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    url: varchar("url").notNull(),
    filename: varchar("filename").notNull(),
    mimeType: varchar("mime_type").notNull(),
    size: integer("size").notNull(), // en bytes
    description: varchar("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tickets_attachment_ticket_id_idx").on(table.ticketId),
    index("tickets_attachment_uploaded_by_id_idx").on(table.uploadedById),
  ],
);
