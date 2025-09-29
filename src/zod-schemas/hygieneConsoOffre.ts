import { hygieneConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { selectHygieneConsoProduitSchema } from "./hygieneConsoProduit";

export const selectHygieneConsoOffreSchema = createSelectSchema(
  hygieneConsoOffres,
  {
    paParPersonne: (schema) =>
      schema.min(0, "Le prix annuel par personne doit être positif"),
  },
);

export type SelectHygieneConsoProduitType =
  typeof selectHygieneConsoProduitSchema._type;
