import { servicesFm4AllTaux } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectServicesFm4AllTauxSchema =
  createSelectSchema(servicesFm4AllTaux);

export type SelectServicesFm4AllTauxType =
  z.infer<typeof selectServicesFm4AllTauxSchema>;
