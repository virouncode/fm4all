import { alarmesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectAlarmesTarifsSchema = createSelectSchema(alarmesTarifs);
export type SelectAlarmesTarifsType = typeof selectAlarmesTarifsSchema._type;
