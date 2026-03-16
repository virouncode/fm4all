import {
  clientServiceExceptionsRecurrence,
  clientServiceReglesRecurrence,
} from "@/db/schema/services";
import { modeAncragePeriodeEnum, periodeQuotaEnum } from "@/db/schema/enums";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== RÈGLES DE RÉCURRENCE ====================

export const selectRegleRecurrenceSchema = createSelectSchema(
  clientServiceReglesRecurrence,
);
export type SelectRegleRecurrenceType = z.infer<
  typeof selectRegleRecurrenceSchema
>;

export const insertRegleRecurrenceFormSchema = z.object({
  clientServiceId: z.uuid("ID de la prestation invalide"),
  libelle: z.string().optional(),
  // ISO datetime string (local wall-clock time, sans timezone)
  dtstartLocal: z.string().min(1, "Date de début obligatoire"),
  fuseauHoraire: z.string().default("Europe/Paris"),
  // RRULE pure sans DTSTART — ex: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  regleRrule: z.string().min(1, "Règle de récurrence obligatoire"),
  dureePrevueMinutes: z.string().optional(), // string dans le form, converti en number côté action
  actif: z.boolean().default(true),
  ordre: z.string().optional(), // string dans le form, converti en number côté action
  /** Checklist optionnelle — null = hérite de l'exécution */
  tacheListeTemplateId: z.uuid().nullable().optional(),
});
export type InsertRegleRecurrenceFormType = z.infer<
  typeof insertRegleRecurrenceFormSchema
>;

export const updateRegleRecurrenceFormSchema = insertRegleRecurrenceFormSchema
  .omit({ clientServiceId: true })
  .partial()
  .extend({
    id: z.uuid("ID de la règle invalide"),
  });
export type UpdateRegleRecurrenceFormType = z.infer<
  typeof updateRegleRecurrenceFormSchema
>;

// Schemas d'action (with entrepriseId for auth check)
export const insertRegleRecurrenceActionSchema =
  insertRegleRecurrenceFormSchema.extend({
    entrepriseId: z.uuid("ID de l'entreprise invalide"),
  });
export type InsertRegleRecurrenceActionType = z.infer<
  typeof insertRegleRecurrenceActionSchema
>;

export const updateRegleRecurrenceActionSchema =
  updateRegleRecurrenceFormSchema.extend({
    entrepriseId: z.uuid("ID de l'entreprise invalide"),
  });
export type UpdateRegleRecurrenceActionType = z.infer<
  typeof updateRegleRecurrenceActionSchema
>;

export const deleteRegleRecurrenceActionSchema = z.object({
  id: z.uuid("ID de la règle invalide"),
  clientServiceId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type DeleteRegleRecurrenceActionType = z.infer<
  typeof deleteRegleRecurrenceActionSchema
>;

export const getReglesRecurrenceActionSchema = z.object({
  clientServiceId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetReglesRecurrenceActionType = z.infer<
  typeof getReglesRecurrenceActionSchema
>;

export const reorderReglesRecurrenceActionSchema = z.object({
  clientServiceId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  // Tableau ordonné des IDs — le nouvel ordre
  orderedIds: z.array(z.uuid()).min(1),
});
export type ReorderReglesRecurrenceActionType = z.infer<
  typeof reorderReglesRecurrenceActionSchema
>;

// ==================== QUOTAS DE PLANIFICATION ====================

export const periodeQuotaSchema = z.enum(periodeQuotaEnum.enumValues);
export type PeriodeQuotaType = z.infer<typeof periodeQuotaSchema>;

export const modeAncragePeriodeSchema = z.enum(
  modeAncragePeriodeEnum.enumValues,
);
export type ModeAncragePeriodeType = z.infer<typeof modeAncragePeriodeSchema>;

export const upsertQuotaPlanificationFormSchema = z.object({
  clientServiceId: z.uuid("ID de la prestation invalide"),
  nbOccurrencesParPeriode: z
    .string()
    .refine(
      (v) =>
        !isNaN(Number(v)) &&
        Number(v) >= 1 &&
        Number(v) <= 52 &&
        Number.isInteger(Number(v)),
      "Le nombre d'occurrences doit être un entier entre 1 et 52",
    ),
  periodeQuota: periodeQuotaSchema,
  modeAncragePeriode: modeAncragePeriodeSchema.default("contrat"),
  // dateAncragePeriode calculée côté serveur (depuis dateDebut du clientService ou calendrier civil)
  notes: z.string().optional(),
});
export type UpsertQuotaPlanificationFormType = z.infer<
  typeof upsertQuotaPlanificationFormSchema
>;

export const upsertQuotaPlanificationActionSchema =
  upsertQuotaPlanificationFormSchema.extend({
    entrepriseId: z.uuid("ID de l'entreprise invalide"),
  });
export type UpsertQuotaPlanificationActionType = z.infer<
  typeof upsertQuotaPlanificationActionSchema
>;

export const getQuotaPlanificationActionSchema = z.object({
  clientServiceId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetQuotaPlanificationActionType = z.infer<
  typeof getQuotaPlanificationActionSchema
>;

export const updateRegleTacheListeSchema = z.object({
  regleId: z.uuid("ID de la règle invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  tacheListeTemplateId: z.uuid().nullable(),
});
export type UpdateRegleTacheListeType = z.infer<
  typeof updateRegleTacheListeSchema
>;
