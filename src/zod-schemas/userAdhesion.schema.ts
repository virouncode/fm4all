import { roleAdhesionCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userAdhesions } from "../db/schema";

export const roleAdhesionSchema = z.enum(roleAdhesionCodes);
export type RoleAdhesionType = z.infer<typeof roleAdhesionSchema>;

export const userAdhesionSelectSchema = createSelectSchema(userAdhesions);
export type UserAdhesionSelectType = z.infer<typeof userAdhesionSelectSchema>;
