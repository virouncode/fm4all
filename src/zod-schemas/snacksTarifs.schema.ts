import { snacksTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectSnacksTarifsSchema = createSelectSchema(snacksTarifs).extend(
  {
    nomPrestataire: z.string().min(1),
    slogan: z.string().nullable(),
    logoStorageKey: z.string().nullable(),
    anneeCreation: z.number().nullable(),
    ca: z.string().nullable(),
    effectifPrestataire: z.string().nullable(),
    nbClients: z.number().nullable(),
    noteGoogle: z.string().nullable(),
    nbAvis: z.number().nullable(),
    imageStorageKey: z.string().nullable(),
  },
);

export type SelectSnacksTarifsType = z.infer<typeof selectSnacksTarifsSchema>;
