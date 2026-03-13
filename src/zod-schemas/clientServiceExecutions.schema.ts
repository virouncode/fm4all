import { upper } from "@/zod-helpers/normalize";
import { modeCommercialSchema } from "@/zod-schemas/clientServices.schema";
import { siretSchema } from "@/zod-schemas/siret.schema";
import { z } from "zod";

// ==================== ENUMS ====================

export const modePilotageSchema = z.enum([
  "client",
  "prestataire",
  "collaboration",
]);
export type ModePilotageType = z.infer<typeof modePilotageSchema>;

export const executionTypePrixSchema = z.enum([
  "abonnement",
  "par_occurrence",
  "installation",
  "frais_livraison",
]);
export type ExecutionTypePrixType = z.infer<typeof executionTypePrixSchema>;

export const executionPeriodeFacturationSchema = z.enum([
  "semaine",
  "mois",
  "annee",
]);
export type ExecutionPeriodeFacturationType = z.infer<
  typeof executionPeriodeFacturationSchema
>;

// ==================== PRIX FORM ====================

// Base sans superRefine pour permettre l'extension
const executionPrixBaseSchema = z.object({
  typePrix: executionTypePrixSchema,
  montantHt: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Le montant doit être un nombre positif",
    ),
  coutPrestataireHt: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined || v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
      "Le coût prestataire doit être un nombre positif",
    ),
  margePourcent: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
      "La marge doit être un nombre entre 0 et 100",
    ),
  periodeFacturation: executionPeriodeFacturationSchema.optional(),
  nbOccurrencesIncluses: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 0 && Number.isInteger(Number(v))),
      "Le nombre d'occurrences doit être un entier positif",
    ),
});

function withAbonnementRefinement<T extends typeof executionPrixBaseSchema>(
  schema: T,
) {
  return schema.superRefine((data, ctx) => {
    if (data.typePrix === "abonnement" && !data.periodeFacturation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periodeFacturation"],
        message: "Période de facturation obligatoire pour un abonnement",
      });
    }
  });
}

export const insertExecutionPrixFormSchema =
  withAbonnementRefinement(executionPrixBaseSchema);

export type InsertExecutionPrixFormType = z.infer<
  typeof insertExecutionPrixFormSchema
>;

// Schema prix pour update (même champs + id optionnel pour diff UPDATE/INSERT)
export const updateExecutionPrixFormSchema = withAbonnementRefinement(
  executionPrixBaseSchema.extend({ id: z.uuid().optional() }),
);
export type UpdateExecutionPrixFormType = z.infer<
  typeof updateExecutionPrixFormSchema
>;

// ==================== EXECUTION FORM ====================

export const insertExecutionFormSchema = z
  .object({
    prestationId: z.uuid("ID de la prestation invalide"),
    entrepriseId: z.uuid("ID de l'entreprise invalide"),
    siteId: z.uuid("ID du site invalide"),
    serviceEntrepriseId: z.uuid("Prestataire obligatoire"),
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
    modePilotage: modePilotageSchema,
    prix: z
      .array(insertExecutionPrixFormSchema)
      .min(1, "Au moins une ligne de tarif est requise"),
  })
  .superRefine((data, ctx) => {
    // Règle : max 1 abonnement par exécution (sinon les périodes se chevauchent)
    const abonnementCount = data.prix.filter(
      (p) => p.typePrix === "abonnement",
    ).length;
    if (abonnementCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'abonnement est autorisée par exécution",
      });
    }
    // Règle : max 1 installation par exécution (facturation one-time)
    const installationCount = data.prix.filter(
      (p) => p.typePrix === "installation",
    ).length;
    if (installationCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'installation est autorisée par exécution",
      });
    }
  });

export type InsertExecutionFormType = z.infer<typeof insertExecutionFormSchema>;

// ==================== UPDATE EXECUTION FORM ====================

export const updateExecutionFormSchema = z
  .object({
    executionId: z.uuid("ID de l'exécution invalide"),
    prestationId: z.uuid("ID de la prestation invalide"),
    entrepriseId: z.uuid("ID de l'entreprise invalide"),
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
    modePilotage: modePilotageSchema,
    prix: z
      .array(updateExecutionPrixFormSchema)
      .min(1, "Au moins une ligne de tarif est requise"),
  })
  .superRefine((data, ctx) => {
    const abonnementCount = data.prix.filter(
      (p) => p.typePrix === "abonnement",
    ).length;
    if (abonnementCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'abonnement est autorisée par exécution",
      });
    }
    const installationCount = data.prix.filter(
      (p) => p.typePrix === "installation",
    ).length;
    if (installationCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'installation est autorisée par exécution",
      });
    }
  });

export type UpdateExecutionFormType = z.infer<typeof updateExecutionFormSchema>;

// ==================== CREATE OR LINK PRESTATAIRE ====================

export const createOrLinkPrestataireSchema = z.object({
  siret: siretSchema("Le SIRET est invalide"),
  // Champs SIRENE — pré-remplis depuis l'API, soumis tels quels
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: z.string().optional(),
  serviceIds: z.array(z.uuid()),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});

export type CreateOrLinkPrestataireType = z.infer<
  typeof createOrLinkPrestataireSchema
>;

// ==================== ACTION SCHEMAS (READ / WRITE) ====================

export const getPrestatairesForServiceSchema = z.object({
  serviceId: z.uuid("ID du service invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  modeCommercial: modeCommercialSchema,
});
export type GetPrestatairesForServiceType = z.infer<
  typeof getPrestatairesForServiceSchema
>;

export const findEntrepriseBySiretSchema = z.object({
  siret: siretSchema("Le SIRET est invalide"),
  clientEntrepriseId: z.uuid().optional(),
});
export type FindEntrepriseBySiretType = z.infer<
  typeof findEntrepriseBySiretSchema
>;

export const toggleExecutionActifSchema = z.object({
  executionId: z.uuid("ID de l'exécution invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  actif: z.boolean(),
});
export type ToggleExecutionActifType = z.infer<
  typeof toggleExecutionActifSchema
>;

export const deleteExecutionSchema = z.object({
  executionId: z.uuid("ID de l'exécution invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type DeleteExecutionType = z.infer<typeof deleteExecutionSchema>;

export const getExecutionsSchema = z.object({
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetExecutionsType = z.infer<typeof getExecutionsSchema>;

export const updateExecutionTacheListeSchema = z.object({
  executionId: z.uuid("ID de l'exécution invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  tacheListeTemplateId: z.uuid().nullable(),
});
export type UpdateExecutionTacheListeType = z.infer<
  typeof updateExecutionTacheListeSchema
>;

export const getClientPrestatairesSchema = z.object({
  clientEntrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetClientPrestatairesType = z.infer<
  typeof getClientPrestatairesSchema
>;

export const getMesSitesClientsSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetMesSitesClientsType = z.infer<typeof getMesSitesClientsSchema>;


export const getMesClientsSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetMesClientsType = z.infer<typeof getMesClientsSchema>;

export const getMesPrestatairesSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetMesPrestatairesType = z.infer<typeof getMesPrestatairesSchema>;

export const updateExecutionModePilotageSchema = z.object({
  executionId: z.uuid("ID de l'exécution invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  modePilotage: modePilotageSchema,
});
export type UpdateExecutionModePilotageType = z.infer<
  typeof updateExecutionModePilotageSchema
>;

// ==================== CREATE OR LINK CLIENT (Posture Prestataire) ====================

export const createOrLinkClientSchema = z.object({
  siret: siretSchema("Le SIRET est invalide"),
  // Champs SIRENE — pré-remplis depuis l'API, soumis tels quels
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: z.string().optional(),
  prestataireEntrepriseId: z.uuid("ID du prestataire invalide"),
});
export type CreateOrLinkClientType = z.infer<typeof createOrLinkClientSchema>;

// ==================== CREATE OR LINK PRESTATAIRE SIMPLE (Posture Client, sans service) ====================

export const createOrLinkPrestataireSimpleSchema = z.object({
  siret: siretSchema("Le SIRET est invalide"),
  // Champs SIRENE — pré-remplis depuis l'API, soumis tels quels
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: z.string().optional(),
  clientEntrepriseId: z.uuid("ID de l'entreprise cliente invalide"),
});
export type CreateOrLinkPrestataireSimpleType = z.infer<
  typeof createOrLinkPrestataireSimpleSchema
>;
