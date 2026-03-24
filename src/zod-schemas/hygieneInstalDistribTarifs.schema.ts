import { hygieneInstalDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneInstalDistribTarifsSchema = createSelectSchema(
  hygieneInstalDistribTarifs,
);

export const selectHygieneInstalDistribTarifsFournisseurSchema =
  createSelectSchema(hygieneInstalDistribTarifs);

export type SelectHygieneInstalDistribTarifsType =
  z.infer<typeof selectHygieneInstalDistribTarifsSchema>;
export type SelectHygieneInstalDistribTarifsFournisseurType =
  z.infer<typeof selectHygieneInstalDistribTarifsFournisseurSchema>;
