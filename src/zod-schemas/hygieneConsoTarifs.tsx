import { hygieneConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

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
);

export type SelectHygieneConsoTarifsType =
  typeof selectHygieneConsoTarifsSchema._type;
