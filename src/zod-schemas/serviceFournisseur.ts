import { servicesFournisseurs } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const insertServiceFournisseurSchema =
  createInsertSchema(servicesFournisseurs);

export type InsertServiceFournisseurType =
  typeof insertServiceFournisseurSchema._type;
