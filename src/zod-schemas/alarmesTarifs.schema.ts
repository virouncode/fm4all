import { alarmesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectAlarmesTarifsSchema = createSelectSchema(alarmesTarifs);
export type SelectAlarmesTarifsType = z.infer<typeof selectAlarmesTarifsSchema>;
