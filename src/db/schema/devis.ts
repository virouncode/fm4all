import { index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { prospects } from "./prospects";

export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: id(),
    prospectId: uuid("prospect_id").references(() => prospects.id),
    documentId: uuid("document_id").references(() => documents.id),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_prospect_id_idx").on(table.prospectId),
    index("devis_temporaires_document_id_idx").on(table.documentId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);
