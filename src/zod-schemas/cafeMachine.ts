import { cafeMachines } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCafeMachinesSchema = createSelectSchema(cafeMachines);

export type SelectCafeMachinesType = z.infer<typeof selectCafeMachinesSchema>;
