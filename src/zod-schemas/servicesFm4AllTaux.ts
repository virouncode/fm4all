import { servicesFm4AllTaux } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectServicesFm4AllTauxSchema =
  createSelectSchema(servicesFm4AllTaux);

export type SelectServicesFm4AllTauxType =
  typeof selectServicesFm4AllTauxSchema._type;
