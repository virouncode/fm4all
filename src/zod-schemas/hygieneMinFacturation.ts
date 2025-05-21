import { hygieneMinFacturation } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneMinFacturationSchema = createSelectSchema(
  hygieneMinFacturation
);

export type SelectHygieneMinFacturationType =
  typeof selectHygieneMinFacturationSchema._type;
