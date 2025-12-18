import z from "zod";
import {
  devisStatusEnum,
  devisTypePrixEnum,
  interventionStatusEnum,
  interventionTypeEnum,
  roleEnum,
  ticketCategorieEnum,
  ticketPrioriteEnum,
  ticketStatusEnum,
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

export const devisStatusSchema = z.enum(devisStatusEnum.enumValues);
export type DevisStatusType = z.infer<typeof devisStatusSchema>;

export const interventionTypeSchema = z.enum(interventionTypeEnum.enumValues);
export type InterventionTypeType = z.infer<typeof interventionTypeSchema>;

export const interventionStatusSchema = z.enum(
  interventionStatusEnum.enumValues,
);
export type InterventionStatusType = z.infer<typeof interventionStatusSchema>;

export const ticketCategorieSchema = z.enum(ticketCategorieEnum.enumValues);
export type TicketCategorieType = z.infer<typeof ticketCategorieSchema>;

export const ticketPrioriteSchema = z.enum(ticketPrioriteEnum.enumValues);
export type TicketPrioriteType = z.infer<typeof ticketPrioriteSchema>;

export const ticketTypeSchema = z.enum(ticketTypeEnum.enumValues);
export type TicketTypeType = z.infer<typeof ticketTypeSchema>;

export const ticketStatusSchema = z.enum(ticketStatusEnum.enumValues);
export type TicketStatusType = z.infer<typeof ticketStatusSchema>;

export const userRoleSchema = z.enum(roleEnum.enumValues);
export type UserRoleType = z.infer<typeof userRoleSchema>;
