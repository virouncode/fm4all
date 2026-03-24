import { officeManagerTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectOfficeManagerTarifsSchema = createSelectSchema(
  officeManagerTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  imageStorageKey: z.string().nullable(),
});

export type SelectOfficeManagerTarifsType =
  z.infer<typeof selectOfficeManagerTarifsSchema>;
