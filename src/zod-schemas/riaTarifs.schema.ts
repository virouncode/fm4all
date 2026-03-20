import { riaTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectRiaTarifsSchema = createSelectSchema(riaTarifs);
export type SelectRiaTarifsType = z.infer<typeof selectRiaTarifsSchema>;
