import { roleEntrepriseCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { entrepriseRoles, entreprises } from "../db/schema";

export const entrepriseSelectSchema = createSelectSchema(entreprises);
export type EntrepriseSelectType = z.infer<typeof entrepriseSelectSchema>;

export const roleEntrepriseSchema = z.enum(roleEntrepriseCodes);
export type RoleEntrepriseType = z.infer<typeof roleEntrepriseSchema>;

export const roleEntrepriseSelectSchema = createSelectSchema(entrepriseRoles);
export type RoleEntrepriseSelectType = z.infer<
  typeof roleEntrepriseSelectSchema
>;
