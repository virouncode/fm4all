import { z } from "zod";

// ==================== ENUMS ====================

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

export const insertExecutionPrixFormSchema = z
  .object({
    typePrix: executionTypePrixSchema,
    montantHt: z.string().refine(
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
  })
  .superRefine((data, ctx) => {
    if (data.typePrix === "abonnement" && !data.periodeFacturation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periodeFacturation"],
        message: "Période de facturation obligatoire pour un abonnement",
      });
    }
  });

export type InsertExecutionPrixFormType = z.infer<
  typeof insertExecutionPrixFormSchema
>;

// ==================== EXECUTION FORM ====================

export const insertExecutionFormSchema = z.object({
  prestationId: z.string().uuid("ID de la prestation invalide"),
  entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
  siteId: z.string().uuid("ID du site invalide"),
  serviceEntrepriseId: z.string().uuid("Prestataire obligatoire"),
  dateDebutValidite: z.string().min(1, "Date de début de validité obligatoire"),
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
  prix: z.array(insertExecutionPrixFormSchema).min(1, "Au moins une ligne de tarif est requise"),
}).superRefine((data, ctx) => {
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
