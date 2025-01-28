import { riaTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectRiaTarifsSchema = createSelectSchema(riaTarifs);
export type SelectRiaTarifsType = typeof selectRiaTarifsSchema._type;
