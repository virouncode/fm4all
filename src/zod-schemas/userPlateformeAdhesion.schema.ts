import { rolePlateformeAdhesionCodes } from "@/constants/codeTables";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userPlateformeAdhesions } from "../db/schema/users";

export const rolePlateformeAdhesionSchema = z.enum(
  rolePlateformeAdhesionCodes,
);
export type RolePlateformeAdhesionType = z.infer<
  typeof rolePlateformeAdhesionSchema
>;

export const userPlateformeAdhesionSelectSchema = createSelectSchema(
  userPlateformeAdhesions,
);
export type UserPlateformeAdhesionSelectType = z.infer<
  typeof userPlateformeAdhesionSelectSchema
>;
