import { roleClientAdhesionCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userClientAdhesions } from "../db/schema";

export const roleClientAdhesionSchema = z.enum(roleClientAdhesionCodes);
export type RoleClientAdhesionType = z.infer<typeof roleClientAdhesionSchema>;

export const userClientAdhesionSelectSchema =
  createSelectSchema(userClientAdhesions);
export type UserClientAdhesionSelectType = z.infer<
  typeof userClientAdhesionSelectSchema
>;
