import { user } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertUserSchema = createInsertSchema(user).extend({
  password: z.string(),
});
export type InsertUserType = typeof insertUserSchema._type;
