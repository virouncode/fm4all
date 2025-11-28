import { servicesFm4AllOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectServicesFm4AllOffresSchema =
  createSelectSchema(servicesFm4AllOffres);

export type SelectServicesFm4AllOffresType =
  z.infer<typeof selectServicesFm4AllOffresSchema>;
