import {
  devisLigneUniteCodes,
  devisStatusCodes,
  devisTypePrixCodes,
} from "@/constants/codeTables";
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { user } from "./auth";
import { clients } from "./clients";
import { fournisseurs } from "./fournisseurs";
import { prospects } from "./prospects";
import { sites } from "./sites";
import { tickets } from "./tickets";

export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: serial().primaryKey(),
    prospectId: integer("prospect_id").references(() => prospects.id),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_prospect_id_idx").on(table.prospectId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);

export const devisStatusEnum = pgEnum("devis_status", devisStatusCodes);
export const devisTypePrixEnum = pgEnum("devis_type_prix", devisTypePrixCodes);

export const devis = pgTable(
  "devis",
  {
    id: serial().primaryKey(),
    prospectId: integer("prospect_id").references(() => prospects.id, {
      onDelete: "set null",
    }),
    clientId: integer("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    fournisseurId: integer("fournisseur_id").references(() => fournisseurs.id, {
      onDelete: "set null",
    }),
    ticketId: integer("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),
    siteId: integer("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    titre: varchar("titre", { length: 255 }).notNull(), //TODO retirer default
    description: text("description").notNull(), //TODO retirer default
    typePrix: devisTypePrixEnum("type_prix").notNull(), //TODO retirer default
    margeCoefficient: numeric("marge_coefficient", {
      precision: 9,
      scale: 8,
    }).notNull(), // ou avec un default(MARGE) si tu veux
    totalOneShotHt: integer("total_one_shot_ht"), //*10000
    totalMensuelHt: integer("total_mensuel_ht"), //*10000
    totalInstallationHt: integer("total_installation_ht"), //*10000
    dateValidite: date("date_validite", { mode: "string" }),
    status: devisStatusEnum("status").notNull().default("emis"), //TODO retirer default
    devisUrl: varchar("devis_url"),
    signedAt: timestamp("signed_at", {
      withTimezone: true,
      precision: 3,
    }),
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
    index("devis_prospect_id_idx").on(table.prospectId),
    index("devis_client_id_idx").on(table.clientId),
    index("devis_ticket_id_idx").on(table.ticketId),
    index("devis_fournisseur_id_idx").on(table.fournisseurId),
    index("devis_status_idx").on(table.status),
    index("devis_created_at_idx").on(table.createdAt),
  ],
);

export const devisLigneUniteEnum = pgEnum(
  "devis_ligne_unite",
  devisLigneUniteCodes,
);

export const devisLignes = pgTable(
  "devis_lignes",
  {
    id: serial().primaryKey(),
    devisId: integer("devis_id")
      .references(() => devis.id, { onDelete: "cascade" })
      .notNull(),
    ordre: integer("ordre").notNull(), //position de la ligne dans le devis
    libelle: varchar("libelle", { length: 255 }).notNull(),
    description: text("description"),
    quantite: numeric("quantite", { precision: 12, scale: 3 }).notNull(),
    unite: devisLigneUniteEnum("unite").notNull(),
    prixUnitaireHt: integer("prix_unitaire_ht").notNull(), // *10000
    totalLigneHt: integer("total_ligne_ht").notNull(), // *10000
    remiseHtMontant: integer("remise_ht").notNull().default(0), // *10000
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("devis_lignes_devis_id_idx").on(table.devisId),
    index("devis_lignes_created_at_idx").on(table.createdAt),
  ],
);
