import { documentTagLinks, documents, documentsTags } from "@/db/schema/documents";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectDocumentSchema = createSelectSchema(documents);
export type SelectDocumentType = z.infer<typeof selectDocumentSchema>;

export const selectDocumentTagSchema = createSelectSchema(documentsTags);
export type SelectDocumentTagType = z.infer<typeof selectDocumentTagSchema>;

export const selectDocumentTagLinkSchema = createSelectSchema(documentTagLinks);
export type SelectDocumentTagLinkType = z.infer<typeof selectDocumentTagLinkSchema>;

// Attachment field (shape expected by RhfFileInput / AttachmentFormType)
export const attachmentFieldSchema = z.object({
  storageKey: z.string().min(1, "Fichier requis"),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  previewUrl: z.string().optional(),
});
export type AttachmentFieldType = z.infer<typeof attachmentFieldSchema>;

// Enriched document returned from queries
export type SelectDocumentWithTagsType = {
  id: string;
  proprietaireEntrepriseId: string;
  proprietaireEntrepriseNom: string;
  categorie: string;
  titre: string | null;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  visibilite: "prive" | "public";
  tags: Array<{ id: string; nom: string; couleur: string | null }>;
};

// Minimal enterprise type
export type EntrepriseMinimalType = { id: string; nom: string };

// ─── Form schemas ────────────────────────────────────────────────────────────

export const insertDocumentFormSchema = z.object({
  entrepriseId: z.uuid("Entreprise requise"),
  titre: z.string().optional(),
  visibilite: z.enum(["prive", "public"]),
  tagIds: z.array(z.uuid()),
  file: attachmentFieldSchema,
});
export type InsertDocumentFormType = z.infer<typeof insertDocumentFormSchema>;

// Update: no file change (delete then re-upload to replace)
export const updateDocumentFormSchema = z.object({
  documentId: z.uuid("Document requis"),
  entrepriseId: z.uuid("Entreprise requise"),
  titre: z.string().optional(),
  visibilite: z.enum(["prive", "public"]),
  tagIds: z.array(z.uuid()),
});
export type UpdateDocumentFormType = z.infer<typeof updateDocumentFormSchema>;

export const deleteDocumentSchema = z.object({
  documentId: z.uuid("Document requis"),
  entrepriseId: z.uuid("Entreprise requise"),
});

// ─── Action input schemas ────────────────────────────────────────────────────

export const getDocumentsSchema = z.object({
  entrepriseId: z.uuid(),
  tab: z.enum(["mes_documents", "partages"]),
  search: z.string().optional(),
  visibilite: z.enum(["prive", "public"]).optional(),
  tagIds: z.array(z.uuid()).optional(),
  partenaireEntrepriseId: z.uuid().optional(),
  orderBy: z
    .enum(["createdAt", "titre", "filename", "sizeBytes", "mimeType"])
    .optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export const insertDocumentTagFormSchema = z.object({
  entrepriseId: z.uuid("Entreprise requise"),
  nom: z
    .string()
    .min(1, "Nom du tag requis")
    .max(50, "Nom trop long (50 car. max)"),
  couleur: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (#rrggbb)")
    .optional(),
});
export type InsertDocumentTagFormType = z.infer<
  typeof insertDocumentTagFormSchema
>;

export const getDocumentPartnersSchema = z.object({
  entrepriseId: z.uuid(),
});
