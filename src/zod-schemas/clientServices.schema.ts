import { clientServices } from "@/db/schema/services";
import {
  clientServiceStatutEnum,
  famillePlanificationEnum,
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

export const famillePlanificationSchema = z.enum(
  famillePlanificationEnum.enumValues,
);
export type FamillePlanificationType = z.infer<
  typeof famillePlanificationSchema
>;

export const clientServiceStatutSchema = z.enum(
  clientServiceStatutEnum.enumValues,
);
export type ClientServiceStatutType = z.infer<typeof clientServiceStatutSchema>;

export const modeCommercialSchema = z.enum(modeCommercialEnum.enumValues);
export type ModeCommercialType = z.infer<typeof modeCommercialSchema>;

// ==================== FORM SCHEMAS ====================
// Form uses string inputs for numbers and dates, converted in actions

export const insertPrestationFormSchema = z.object({
  // Relations obligatoires
  entrepriseId: z.uuid("Client obligatoire"),
  siteId: z.uuid("Site obligatoire"),
  serviceId: z.uuid("Service obligatoire"),

  // Famille de planification (dérivée automatiquement, jamais saisie directement)
  famillePlanification: famillePlanificationSchema,

  // Dates (ISO strings dans le form, Date en DB)
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),

  // Statut & mode commercial
  statut: clientServiceStatutSchema.optional(),
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
  "updatedAt",
  "serviceNom",
  "siteNom",
  "statut",
  "famillePlanification",
  "dateDebut",
]);
export type PrestationsOrderByType = z.infer<typeof prestationsOrderBySchema>;

export const getPrestationsQuerySchema = z.object({
  // Optionnel : si absent, la plateforme peut voir tous les clients (cross-client)
  entrepriseId: z.uuid("ID de l'entreprise invalide").optional(),
  // Posture prestataire : ID du prestataire (filtre via clientServiceExecutions → serviceEntreprises)
  prestataireEntrepriseId: z.uuid("ID du prestataire invalide").optional(),
  statut: clientServiceStatutSchema.optional(),
  famillePlanification: famillePlanificationSchema.optional(),
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

// Action INSERT prestation + exécution en une transaction (posture prestataire)
// modeCommercial est toujours "direct" et n'est pas exposé dans ce schéma.
export const insertPrestationWithExecutionActionSchema =
  insertPrestationActionSchema.extend({
    // serviceEntrepriseId résolu automatiquement côté client (depuis serviceEntreprises)
    serviceEntrepriseId: z.uuid("Prestataire invalide"),
    dateDebutValidite: z
      .string()
      .min(1, "Date de début de validité obligatoire"),
    dateFinValidite: z.string().optional(),
    priorite: z
      .string()
      .refine(
        (v) =>
          !isNaN(Number(v)) &&
          Number(v) >= 0 &&
          Number(v) <= 100 &&
          Number.isInteger(Number(v)),
        "La priorité doit être un entier entre 0 et 100",
      ),
    modePilotage: z.enum(["client", "prestataire", "collaboration"]),
    prix: z
      .array(
        z
          .object({
            typePrix: z.enum([
              "abonnement",
              "par_occurrence",
              "installation",
              "frais_livraison",
            ]),
            montantHt: z
              .string()
              .refine(
                (v) => !isNaN(Number(v)) && Number(v) >= 0,
                "Le montant doit être un nombre positif",
              ),
            coutPrestataireHt: z.string().optional(),
            margePourcent: z.string().optional(),
            periodeFacturation: z
              .enum(["semaine", "mois", "annee"])
              .optional(),
            nbOccurrencesIncluses: z.string().optional(),
          })
          .superRefine((data, ctx) => {
            if (
              data.typePrix === "abonnement" &&
              !data.periodeFacturation
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["periodeFacturation"],
                message:
                  "Période de facturation obligatoire pour un abonnement",
              });
            }
          }),
      )
      .min(1, "Au moins une ligne de tarif est requise"),
  });
export type InsertPrestationWithExecutionActionType = z.infer<
  typeof insertPrestationWithExecutionActionSchema
>;

// Action UPDATE prestation (form + entrepriseId)
export const updatePrestationActionSchema = updatePrestationFormSchema.extend({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type UpdatePrestationActionType = z.infer<
  typeof updatePrestationActionSchema
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
  famillePlanification: FamillePlanificationType;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut: ClientServiceStatutType;
  modeCommercial: ModeCommercialType;
  notes: string | null;
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
    famillePlanification: famillePlanificationSchema,
    dateDebut: z.date().nullable(),
    dateFin: z.date().nullable(),
    statut: clientServiceStatutSchema,
    modeCommercial: modeCommercialSchema,
    notes: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
);
