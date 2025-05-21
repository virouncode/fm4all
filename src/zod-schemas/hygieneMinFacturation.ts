import { RATIO } from "@/constants/constants";
import { hygieneMinFacturation } from "@/db/schema";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneMinFacturationSchema = createSelectSchema(
  hygieneMinFacturation
);

export const updateHygieneMinFacturationSchema = createUpdateSchema(
  hygieneMinFacturation,
  {
    minFacturation: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number((Number(val) * RATIO).toFixed(0))),
        schema.refine(
          (val) => val > 0,
          "Le minimum de facturation doit être supérieur à 0"
        )
      ),
  }
);

export const updateHygieneMinFacturationServerSchema = createUpdateSchema(
  hygieneMinFacturation
);

export type SelectHygieneMinFacturationType =
  typeof selectHygieneMinFacturationSchema._type;

export type UpdateHygieneMinFacturationType =
  typeof updateHygieneMinFacturationSchema._type;
