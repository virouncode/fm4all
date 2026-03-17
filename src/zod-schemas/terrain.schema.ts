import { occurrenceTacheTransitionStatutSchema } from "@/zod-schemas/clientServiceOccurrences.schema";
import { z } from "zod";

// ==================== OPEN SESSION ====================

export const openTerrainSessionSchema = z.object({
  token: z.string().min(1),
  agentNom: z.string().min(1, "Le prénom est obligatoire").max(150),
});
export type OpenTerrainSessionType = z.infer<typeof openTerrainSessionSchema>;

// ==================== START OCCURRENCE ====================

export const startOccurrenceFieldSchema = z.object({
  token: z.string().min(1),
  sessionId: z.uuid("ID de session invalide"),
});
export type StartOccurrenceFieldType = z.infer<typeof startOccurrenceFieldSchema>;

// ==================== UPDATE TACHE ====================

export const updateTacheFieldSchema = z.object({
  token: z.string().min(1),
  tacheId: z.uuid("ID de tâche invalide"),
  statut: occurrenceTacheTransitionStatutSchema,
  sessionId: z.uuid("ID de session invalide"),
});
export type UpdateTacheFieldType = z.infer<typeof updateTacheFieldSchema>;

// ==================== TERMINATE OCCURRENCE ====================

export const terminateOccurrenceFieldSchema = z.object({
  token: z.string().min(1),
  sessionId: z.uuid("ID de session invalide"),
});
export type TerminateOccurrenceFieldType = z.infer<
  typeof terminateOccurrenceFieldSchema
>;

// ==================== ADD PIECE JOINTE ====================

export const addTachePieceJointeFieldSchema = z.object({
  token: z.string().min(1),
  tacheId: z.uuid("ID de tâche invalide"),
  storageKey: z.string().min(1, "Clé S3 requise"),
  filename: z.string().min(1, "Nom de fichier requis"),
  mimeType: z.string().min(1, "Type MIME requis"),
  sizeBytes: z.number().int().positive("Taille invalide"),
});
export type AddTachePieceJointeFieldType = z.infer<
  typeof addTachePieceJointeFieldSchema
>;
