import { boissonsOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectBoissonsOffreSchema = createSelectSchema(boissonsOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectBoissonsOffreType = typeof selectBoissonsOffreSchema._type;
