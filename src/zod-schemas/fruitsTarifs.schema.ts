import { fruitsTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFruitsTarifsSchema = createSelectSchema(fruitsTarifs).extend(
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

export type SelectFruitsTarifsType = z.infer<typeof selectFruitsTarifsSchema>;
