import { cafeMachinesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCafeMachinesTarifsSchema = createSelectSchema(
  cafeMachinesTarifs,
  {
    limiteBoissonsJ: (schema) =>
      schema.min(20, "La limite de boissons par jour est obligatoire"),
  }
).extend({
  nomEntreprise: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectCafeMachinesTarifsType =
  typeof selectCafeMachinesTarifsSchema._type;
