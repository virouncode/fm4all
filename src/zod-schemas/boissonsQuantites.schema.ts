import { boissonsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectBoissonsQuantitesSchema =
  createSelectSchema(boissonsQuantites);

export type SelectBoissonsQuantitesType = z.infer<
  typeof selectBoissonsQuantitesSchema
>;
