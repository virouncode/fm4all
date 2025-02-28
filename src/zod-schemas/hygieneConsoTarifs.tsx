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
  }
).extend({
  nomFournisseur: z.string().nonempty("Le nom de l'entreprise est requis"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
  locationUrl: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectif: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export type SelectHygieneConsoTarifsType =
  typeof selectHygieneConsoTarifsSchema._type;
