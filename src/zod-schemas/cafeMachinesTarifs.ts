import { cafeMachinesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCafeMachinesTarifsSchema = createSelectSchema(
  cafeMachinesTarifs
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

export type SelectCafeMachinesTarifsType =
  typeof selectCafeMachinesTarifsSchema._type;
