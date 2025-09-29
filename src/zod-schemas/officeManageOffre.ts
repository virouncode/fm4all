import { officeManagerOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectOfficeManagerOffreSchema = createSelectSchema(
  officeManagerOffres,
  {
    demiTjm: (schema) => schema.min(1, "Le demi TJM est obligatoire"),
  },
);

export type SelectOfficeManagerOffreType =
  typeof selectOfficeManagerOffreSchema._type;
