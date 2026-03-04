import { clientServices } from "@/db/schema/services";
import {
  clientServiceModePlanningEnum,
  clientServiceStatutEnum,
  frequenceEnum,
  modeCommercialEnum,
} from "@/db/schema/enums";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// ==================== BASE SCHEMAS (FROM DB) ====================

// SELECT SCHEMA
export const selectClientServiceSchema = createSelectSchema(clientServices);
export type SelectClientServiceType = z.infer<
  typeof selectClientServiceSchema
>;

// INSERT SCHEMA (omit auto-generated fields)
export const insertClientServiceSchema = createInsertSchema(
  clientServices,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});
export type InsertClientServiceType = z.infer<typeof insertClientServiceSchema>;

// INSERT TO DB (add server-side fields)
export const insertClientServiceToDbSchema = insertClientServiceSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string()
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});
export type InsertClientServiceToDbType = z.infer<
  typeof insertClientServiceToDbSchema
>;

// UPDATE SCHEMA
export const updateClientServiceSchema = createUpdateSchema(clientServices)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true,
    updatedById: true,
    entrepriseId: true, // cannot change the client
    siteId: true, // cannot change the site
    serviceId: true, // cannot change the service type
  })
  .extend({
    id: z.uuid("ID de la prestation invalide"),
  });
export type UpdateClientServiceType = z.infer<typeof updateClientServiceSchema>;

// UPDATE TO DB (add updatedById)
export const updateClientServiceToDbSchema = updateClientServiceSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, // not in the set clause
  });
export type UpdateClientServiceToDbType = z.infer<
  typeof updateClientServiceToDbSchema
>;

// ==================== ENUM SCHEMAS ====================

export const frequenceSchema = z.enum(frequenceEnum.enumValues);
export type FrequenceType = z.infer<typeof frequenceSchema>;

export const clientServiceStatutSchema = z.enum(
  clientServiceStatutEnum.enumValues,
);
export type ClientServiceStatutType = z.infer<typeof clientServiceStatutSchema>;

export const clientServiceModePlanningSchema = z.enum(
  clientServiceModePlanningEnum.enumValues,
);
export type ClientServiceModePlanningType = z.infer<
  typeof clientServiceModePlanningSchema
>;

export const modeCommercialSchema = z.enum(modeCommercialEnum.enumValues);
export type ModeCommercialType = z.infer<typeof modeCommercialSchema>;

// ==================== FORM SCHEMAS ====================
// Form uses string inputs for numbers and dates, converted in actions

export const insertPrestationFormSchema = z.object({
  // Relations obligatoires
  entrepriseId: z.uuid("Client obligatoire"),
  siteId: z.uuid("Site obligatoire"),
  serviceId: z.uuid("Service obligatoire"),

  // Fréquence
  frequence: frequenceSchema,
  frequenceParPeriode: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 365),
      "La fréquence par période doit être un nombre entre 1 et 365",
    ),
  intervalleJours: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 365),
      "L'intervalle doit être un nombre entre 1 et 365 jours",
    ),

  // Dates (ISO strings dans le form, Date en DB)
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),

  // Préférences de planification
  joursPreference: z.array(z.number().int().min(1).max(7)).optional(),
  // ISO 8601 : 1=lundi … 7=dimanche
  heureDebutPreference: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined || v === "" || /^([0-1]?\d|2[0-3]):[0-5]\d$/.test(v),
      "Format invalide (ex: 08:00)",
    ),
  dureeEstimeeMinutes: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 720),
      "La durée doit être un nombre entre 1 et 720 minutes",
    ),

  // Planning
  statut: clientServiceStatutSchema.optional(),
  modePlanning: clientServiceModePlanningSchema.optional(),
  modeCommercial: modeCommercialSchema.optional(),

  // Commentaires
  notes: z.string().optional(),
});
export type InsertPrestationFormType = z.infer<
  typeof insertPrestationFormSchema
>;

export const updatePrestationFormSchema = insertPrestationFormSchema
  .omit({
    entrepriseId: true, // non modifiable
    siteId: true, // non modifiable
    serviceId: true, // non modifiable
  })
  .partial()
  .extend({
    id: z.uuid("ID de la prestation invalide"),
    statut: clientServiceStatutSchema.optional(),
    modePlanning: clientServiceModePlanningSchema.optional(),
    modeCommercial: modeCommercialSchema.optional(),
  });
export type UpdatePrestationFormType = z.infer<typeof updatePrestationFormSchema>;

// Schema spécifique pour le changement de statut (cycle de vie)
export const updatePrestationStatutSchema = z.object({
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  statut: clientServiceStatutSchema,
});
export type UpdatePrestationStatutType = z.infer<
  typeof updatePrestationStatutSchema
>;

// ==================== QUERY SCHEMAS ====================

export const prestationsOrderBySchema = z.enum([
  "createdAt",
  "serviceNom",
  "siteNom",
  "statut",
  "frequence",
  "dateDebut",
]);
export type PrestationsOrderByType = z.infer<typeof prestationsOrderBySchema>;

export const getPrestationsQuerySchema = z.object({
  // Optionnel : si absent, la plateforme peut voir tous les clients (cross-client)
  entrepriseId: z.uuid("ID de l'entreprise invalide").optional(),
  statut: clientServiceStatutSchema.optional(),
  serviceId: z.uuid().optional(),
  siteId: z.uuid().optional(),
  modeCommercial: modeCommercialSchema.optional(),
  orderBy: prestationsOrderBySchema.optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});
export type GetPrestationsQueryType = z.infer<typeof getPrestationsQuerySchema>;

// ==================== ACTION SCHEMAS ====================

// Identifie une prestation dans une entreprise (read / delete)
export const prestationByIdSchema = z.object({
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type PrestationByIdType = z.infer<typeof prestationByIdSchema>;

// Entrée de périmètre (inclure/exclure un site)
export const perimetreEntrySchema = z.object({
  siteId: z.uuid("ID de site invalide"),
  mode: z.enum(["inclure", "exclure"]),
  scope: z.enum(["self", "subtree"]),
});
export type PerimetreEntryType = z.infer<typeof perimetreEntrySchema>;

// Action INSERT prestation (form + perimetre + entrepriseId)
export const insertPrestationActionSchema = insertPrestationFormSchema.extend({
  perimetre: z
    .array(perimetreEntrySchema)
    .min(1, "Au moins une entrée de périmètre est requise"),
});
export type InsertPrestationActionType = z.infer<
  typeof insertPrestationActionSchema
>;

// Action UPDATE prestation (form + entrepriseId)
export const updatePrestationActionSchema = updatePrestationFormSchema.extend({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type UpdatePrestationActionType = z.infer<
  typeof updatePrestationActionSchema
>;

// Mise à jour de la checklist par défaut d'une prestation
export const updateClientServiceTacheListeSchema = z.object({
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  tacheListeTemplateId: z.uuid().nullable(),
});
export type UpdateClientServiceTacheListeType = z.infer<
  typeof updateClientServiceTacheListeSchema
>;

// ==================== JOINED TYPE (pour la liste) ====================

export type PrestationListItem = {
  id: string;
  entrepriseId: string;
  entrepriseNom: string;
  siteId: string;
  siteNom: string;
  serviceId: string;
  serviceNom: string;
  frequence: FrequenceType;
  frequenceParPeriode: number | null;
  intervalleJours: number | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  joursPreference: number[] | null;
  heureDebutPreference: string | null;
  dureeEstimeeMinutes: number | null;
  statut: ClientServiceStatutType;
  modePlanning: ClientServiceModePlanningType;
  modeCommercial: ModeCommercialType;
  notes: string | null;
  tacheListeTemplateId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const prestationListItemSchema: z.ZodType<PrestationListItem> = z.object(
  {
    id: z.string(),
    entrepriseId: z.string(),
    entrepriseNom: z.string(),
    siteId: z.string(),
    siteNom: z.string(),
    serviceId: z.string(),
    serviceNom: z.string(),
    frequence: frequenceSchema,
    frequenceParPeriode: z.number().nullable(),
    intervalleJours: z.number().nullable(),
    dateDebut: z.date().nullable(),
    dateFin: z.date().nullable(),
    joursPreference: z.array(z.number()).nullable(),
    heureDebutPreference: z.string().nullable(),
    dureeEstimeeMinutes: z.number().nullable(),
    statut: clientServiceStatutSchema,
    modePlanning: clientServiceModePlanningSchema,
    modeCommercial: modeCommercialSchema,
    notes: z.string().nullable(),
    tacheListeTemplateId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
);
