import { legioTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectLegioTarifsSchema = createSelectSchema(legioTarifs);

export type SelectLegioTarifsType = z.infer<typeof selectLegioTarifsSchema>;
