import { roleClientAdhesionCodes, rolePrestataireAdhesionCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userClientAdhesions } from "../db/schema";

export const roleClientAdhesionSchema = z.enum(roleClientAdhesionCodes);
export type RoleClientAdhesionType = z.infer<typeof roleClientAdhesionSchema>;

export const rolePrestataireAdhesionSchema = z.enum(rolePrestataireAdhesionCodes);
export type RolePrestataireAdhesionType = z.infer<typeof rolePrestataireAdhesionSchema>;

export const userClientAdhesionSelectSchema =
  createSelectSchema(userClientAdhesions);
export type UserClientAdhesionSelectType = z.infer<
  typeof userClientAdhesionSelectSchema
>;
