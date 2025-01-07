import { z } from "zod";

export const companyInfoSchema = z.object({
  siret: z
    .string()
    .regex(
      /^\d{3} \d{3} \d{3} \d{5}$/,
      "Siret invalide, format attendu : XXX XXX XXX XXXXX"
    ),
  nomEntreprise: z.string().min(1, "Nom de l'entreprise obligatoire"),
  prenomContact: z.string().min(1, "Prénom du contact obligatoire"),
  nomContact: z.string().min(1, "Nom du contact obligatoire"),
  posteContact: z.string(),
  adresseLigne1: z.string().min(1, "Adresse ligne 1 obligatoire"),
  adresseLigne2: z.string(),
  codePostal: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: z.string().min(1, "Ville obligatoire"),
  phone: z
    .string()
    .regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
      "Numéro de téléphone invalide, format attendu : XX XX XX XX XX"
    ),
  email: z.string().email("Adresse email invalide"),
  surface: z
    .string()
    .regex(/^\d+$/, "Surface invalide : entrez un chiffre entier"),
  effectif: z
    .string()
    .regex(/^\d+$/, "Nombre de personnes invalide : entrez un chiffre entier"),
  typeBatiment: z.enum(
    ["bureaux", "localCommercial", "entreport", "cabinetMedical"],
    { message: "Type de batiment invalide" }
  ),
  typeOccupation: z.enum(["partieEtage", "plateauComplet", "batimentEntier"], {
    message: "Type d'occupation invalide",
  }),
});

export type CompanyInfoType = z.infer<typeof companyInfoSchema>;
