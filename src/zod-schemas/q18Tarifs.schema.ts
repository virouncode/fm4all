import { q18Tarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectQ18TarifsSchema = createSelectSchema(q18Tarifs);

export type SelectQ18TarifsType = z.infer<typeof selectQ18TarifsSchema>;
