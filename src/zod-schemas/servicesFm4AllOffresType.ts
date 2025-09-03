import { servicesFm4AllOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectServicesFm4AllOffresSchema =
  createSelectSchema(servicesFm4AllOffres);

export type SelectServicesFm4AllOffresType =
  typeof selectServicesFm4AllOffresSchema._type;
