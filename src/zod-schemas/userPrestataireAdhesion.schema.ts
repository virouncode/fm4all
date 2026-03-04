import { rolePrestataireAdhesionCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userPrestataireAdhesions } from "../db/schema";

export const rolePrestataireAdhesionSchema = z.enum(
  rolePrestataireAdhesionCodes,
);
export type RolePrestataireAdhesionType = z.infer<
  typeof rolePrestataireAdhesionSchema
>;

export const userPrestataireAdhesionSelectSchema = createSelectSchema(
  userPrestataireAdhesions,
);
export type UserPrestataireAdhesionSelectType = z.infer<
  typeof userPrestataireAdhesionSelectSchema
>;
