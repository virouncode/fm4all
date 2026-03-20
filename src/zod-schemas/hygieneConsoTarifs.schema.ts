import { hygieneConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneConsoTarifsSchema = createSelectSchema(
  hygieneConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    paParPersonneEmp: (schema) =>
      schema.min(1, "Le prix annuel par personne emp est obligatoire"),
    paParPersonneSavon: (schema) =>
      schema.min(1, "Le prix annuel par personne savon est obligatoire"),
    paParPersonnePh: (schema) =>
      schema.min(1, "Le prix annuel par personne ph est obligatoire"),
    paParPersonneDesinfectant: (schema) =>
      schema.min(1, "Le prix annuel par personne desinfectant est obligatoire"),
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectif: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export const selectHygieneConsoTarifsFournisseurSchema = createSelectSchema(
  hygieneConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    paParPersonneEmp: (schema) =>
      schema.min(1, "Le prix annuel par personne emp est obligatoire"),
    paParPersonneSavon: (schema) =>
      schema.min(1, "Le prix annuel par personne savon est obligatoire"),
    paParPersonnePh: (schema) =>
      schema.min(1, "Le prix annuel par personne ph est obligatoire"),
    paParPersonneDesinfectant: (schema) =>
      schema.min(1, "Le prix annuel par personne desinfectant est obligatoire"),
  },
);

export type SelectHygieneConsoTarifsType =
  z.infer<typeof selectHygieneConsoTarifsSchema>;

export type SelectHygieneConsoTarifsFournisseurType =
  z.infer<typeof selectHygieneConsoTarifsFournisseurSchema>;
