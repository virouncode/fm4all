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
import { devisTemporaires } from "./devis";
import { entreprises } from "./entreprises";
import {
  documentCategorieEnum,
  documentVisibiliteEnum,
  storageProviderEnum,
} from "./enums";
import { user } from "./user";

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

    // "dossier" entreprise / global
    entrepriseId: uuid("entreprise_id").references(() => entreprises.id, {
      onDelete: "cascade",
    }),

    // Comparateur public
    devisTemporaireId: uuid("devis_temporaire_id").references(
      () => devisTemporaires.id,
      { onDelete: "cascade" },
    ),

    // Tables gérées par l'outil FM — pas de FK Drizzle dans ce projet (migrations FM uniquement)
    siteId: uuid("site_id"),
    ticketId: uuid("ticket_id"),
    ticketMessageId: uuid("ticket_message_id"),
    devisId: uuid("devis_id"),
    devisDemandeId: uuid("devis_demande_id"),
    contratId: uuid("contrat_id"),
    factureId: uuid("facture_id"),

    // Tables gérées par l'outil FM (suite)
    occurrenceId: uuid("occurrence_id"),
    clientServiceId: uuid("client_service_id"),
    clientServiceExecutionId: uuid("client_service_execution_id"),
    occurrenceTacheId: uuid("occurrence_tache_id"),

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

    index("documents_links_devis_temporaire_idx").on(t.devisTemporaireId),
    index("documents_links_ticket_idx").on(t.ticketId),
    index("documents_links_ticket_message_idx").on(t.ticketMessageId),
    index("documents_links_site_idx").on(t.siteId),
    index("documents_links_occurrence_idx").on(t.occurrenceId),
    index("documents_links_devis_idx").on(t.devisId),
    index("documents_links_devis_demande_idx").on(t.devisDemandeId),
    index("documents_links_contrat_idx").on(t.contratId),
    index("documents_links_facture_idx").on(t.factureId),

    index("documents_links_owner_vis_idx").on(
      t.proprietaireEntrepriseId,
      t.visibilite,
    ),
  ],
);
