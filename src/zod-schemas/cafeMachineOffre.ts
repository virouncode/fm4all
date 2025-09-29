import { cafeMachinesOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectCafeMachineOffreSchema =
  createSelectSchema(cafeMachinesOffres);

export type SelectCafeMachineOffreType =
  typeof selectCafeMachineOffreSchema._type;
