import z from "zod";
import {
  devisStatutEnum,
  devisTypePrixEnum,
  roleEnum,
  ticketMessageVisibiliteEnum,
  ticketPrioriteEnum,
  ticketStatutEnum,
  ticketTypeEnum,
  typeBatimentEnum,
  typeOccupationEnum,
} from "../db/schema";

export const typeBatimentSchema = z.enum(typeBatimentEnum.enumValues);
export type TypeBatimentType = z.infer<typeof typeBatimentSchema>;

export const typeOccupationSchema = z.enum(typeOccupationEnum.enumValues);
export type TypeOccupationType = z.infer<typeof typeOccupationSchema>;

export const devisTypePrixSchema = z.enum(devisTypePrixEnum.enumValues);
export type DevisTypePrixType = z.infer<typeof devisTypePrixSchema>;

export const devisStatutSchema = z.enum(devisStatutEnum.enumValues);
export type DevisStatutType = z.infer<typeof devisStatutSchema>;

export const ticketPrioriteSchema = z.enum(ticketPrioriteEnum.enumValues);
export type TicketPrioriteType = z.infer<typeof ticketPrioriteSchema>;

export const ticketTypeSchema = z.enum(ticketTypeEnum.enumValues);
export type TicketTypeType = z.infer<typeof ticketTypeSchema>;

export const ticketStatutSchema = z.enum(ticketStatutEnum.enumValues);
export type TicketStatutType = z.infer<typeof ticketStatutSchema>;

export const ticketMessageVisibiliteSchema = z.enum(
  ticketMessageVisibiliteEnum.enumValues
);
export type TicketMessageVisibiliteType = z.infer<
  typeof ticketMessageVisibiliteSchema
>;

export const userRoleSchema = z.enum(roleEnum.enumValues);
export type UserRoleType = z.infer<typeof userRoleSchema>;
