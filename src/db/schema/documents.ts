import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./auth";
import { contrats } from "./contrats";
import { devis } from "./devis";
import { entreprises } from "./entreprises";
import {
  documentCategorieEnum,
  documentVisibiliteEnum,
  storageProviderEnum,
} from "./enums";
import { factures } from "./factures";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
  occurrenceTaches,
} from "./services";
import { sites } from "./sites";
import { tickets } from "./tickets";

export const documents = pgTable(
  "documents",
  {
    id: id(),
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    categorie: documentCategorieEnum("categorie").notNull(),
    titre: varchar("titre", { length: 255 }),

    storageProvider: storageProviderEnum("storage_provider").notNull(),
    storageKey: varchar("storage_key", { length: 1024 }).notNull(),

    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),

    createdById: createdById(() => user),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("documents_provider_key_udx").on(
      t.storageProvider,
      t.storageKey,
    ),
    index("documents_owner_idx").on(t.proprietaireEntrepriseId),
    index("documents_created_by_idx").on(t.createdById),
    index("documents_created_at_idx").on(t.createdAt),
  ],
);

export const documentsLinks = pgTable(
  "documents_links",
  {
    id: id(),

    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    // “dossier” entreprise / global
    entrepriseId: uuid("entreprise_id").references(() => entreprises.id, {
      onDelete: "cascade",
    }),
    siteId: uuid("site_id").references(() => sites.id, { onDelete: "cascade" }),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "cascade",
    }),
    occurrenceId: uuid("occurrence_id").references(
      () => clientServiceOccurrences.id,
      { onDelete: "cascade" },
    ),
    devisId: uuid("devis_id").references(() => devis.id, {
      onDelete: "cascade",
    }),
    contratId: uuid("contrat_id").references(() => contrats.id, {
      onDelete: "cascade",
    }),
    factureId: uuid("facture_id").references(() => factures.id, {
      onDelete: "cascade",
    }),
    clientServiceId: uuid("client_service_id").references(
      () => clientServices.id,
      { onDelete: "cascade" },
    ),
    clientServiceExecutionId: uuid("client_service_execution_id").references(
      () => clientServiceExecutions.id,
      { onDelete: "cascade" },
    ),
    occurrenceTacheId: uuid("occurrence_tache_id").references(
      () => occurrenceTaches.id,
      { onDelete: "cascade" },
    ),

    visibilite: documentVisibiliteEnum("visibilite")
      .notNull()
      .default("public"),

    createdAt: createdAt(),
    createdById: createdById(() => user),
    updatedAt: updatedAt(),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("documents_links_owner_idx").on(t.proprietaireEntrepriseId),
    index("documents_links_document_idx").on(t.documentId),

    index("documents_links_ticket_idx").on(t.ticketId),
    index("documents_links_site_idx").on(t.siteId),
    index("documents_links_occurrence_idx").on(t.occurrenceId),
    index("documents_links_devis_idx").on(t.devisId),
    index("documents_links_contrat_idx").on(t.contratId),
    index("documents_links_facture_idx").on(t.factureId),

    index("documents_links_owner_vis_idx").on(
      t.proprietaireEntrepriseId,
      t.visibilite,
    ),
  ],
);
