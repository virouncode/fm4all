import { clientServiceExceptionsRecurrence } from "@/db/schema/services";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectExceptionRecurrenceSchema = createSelectSchema(
  clientServiceExceptionsRecurrence,
);
export type SelectExceptionRecurrenceType = z.infer<
  typeof selectExceptionRecurrenceSchema
>;

/**
 * Scope d'une exception :
 *   "occurrence"  → cette occurrence seulement
 *   "suivantes"   → cette occurrence et toutes les suivantes (tronque la série)
 *   "serie"       → toute la série (désactive la règle)
 */
export const exceptionScopeSchema = z.enum(["occurrence", "suivantes", "serie"]);
export type ExceptionScopeType = z.infer<typeof exceptionScopeSchema>;

// ==================== SUPPRIMÉE ====================

export const createExceptionSupprimeeSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  clientServiceId: z.uuid("ID de la prestation invalide"),
  regleRecurrenceId: z.uuid("ID de la règle invalide"),
  /** Instant UTC de l'occurrence théorique (ISO 8601) */
  dateOriginale: z.string().datetime({ message: "Date invalide" }),
  scope: exceptionScopeSchema,
  motif: z.string().optional(),
});
export type CreateExceptionSupprimeeType = z.infer<
  typeof createExceptionSupprimeeSchema
>;

// ==================== DÉPLACÉE ====================

export const createExceptionDeplaceeSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  clientServiceId: z.uuid("ID de la prestation invalide"),
  regleRecurrenceId: z.uuid("ID de la règle invalide"),
  /** Instant UTC de l'occurrence théorique d'origine (ISO 8601) */
  dateOriginale: z.string().datetime({ message: "Date invalide" }),
  /** Nouveau début (UTC, ISO 8601) */
  nouvelleDateDebut: z.string().datetime({ message: "Nouvelle date invalide" }),
  /** Nouvelle fin (UTC, ISO 8601) — optionnelle */
  nouvelleHeureFin: z
    .string()
    .datetime({ message: "Heure de fin invalide" })
    .optional(),
  /** Scopes possibles : occurrence | suivantes */
  scope: z.enum(["occurrence", "suivantes"]),
  motif: z.string().optional(),
});
export type CreateExceptionDeplaceeType = z.infer<
  typeof createExceptionDeplaceeSchema
>;
