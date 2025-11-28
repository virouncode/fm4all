import { servicesFournisseurs } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertServiceFournisseurSchema =
  createInsertSchema(servicesFournisseurs);

export type InsertServiceFournisseurType =
  z.infer<typeof insertServiceFournisseurSchema>;
