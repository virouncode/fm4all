import z from "zod";
import {
  devisDemandeStatutEnum,
  devisPeriodeFacturationEnum,
  devisStatutEnum,
  devisTypePrixEnum,
  documentVisibiliteEnum,
  factureLigneTypeSourceEnum,
  factureModeCommercialSnapshotEnum,
  factureStatutEnum,
  occurrenceStatutEnum,
  occurrenceTacheStatutEnum,
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

export const devisDemandeStatutSchema = z.enum(
  devisDemandeStatutEnum.enumValues,
);
export type DevisDemandeStatutType = z.infer<typeof devisDemandeStatutSchema>;

export const devisPeriodeFacturationSchema = z.enum(
  devisPeriodeFacturationEnum.enumValues,
);
export type DevisPeriodeFacturationType = z.infer<
  typeof devisPeriodeFacturationSchema
>;

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

export const occurrenceStatutSchema = z.enum(occurrenceStatutEnum.enumValues);
export type OccurrenceStatutType = z.infer<typeof occurrenceStatutSchema>;

// Sous-ensemble valide pour les transitions (planifiee n'est pas une cible de transition)
export const occurrenceTransitionStatutSchema =
  occurrenceStatutSchema.exclude(["planifiee"]);
export type OccurrenceTransitionStatutType = z.infer<
  typeof occurrenceTransitionStatutSchema
>;

export const occurrenceTacheStatutSchema = z.enum(occurrenceTacheStatutEnum.enumValues);
export type OccurrenceTacheStatutType = z.infer<typeof occurrenceTacheStatutSchema>;

export const devisLigneUniteSchema = z.string().min(1, "Unité obligatoire");
export type DevisLigneUniteType = string;

export const factureStatutSchema = z.enum(factureStatutEnum.enumValues);
export type FactureStatutType = z.infer<typeof factureStatutSchema>;

export const factureLigneTypeSourceSchema = z.enum(
  factureLigneTypeSourceEnum.enumValues,
);
export type FactureLigneTypeSourceType = z.infer<
  typeof factureLigneTypeSourceSchema
>;

export const factureLigneUniteSchema = z.string().min(1, "Unité obligatoire");
export type FactureLigneUniteType = string;

export const factureModeCommercialSnapshotSchema = z.enum(
  factureModeCommercialSnapshotEnum.enumValues,
);
export type FactureModeCommercialSnapshotType = z.infer<
  typeof factureModeCommercialSnapshotSchema
>;

export const documentVisibiliteSchema = z.enum(
  documentVisibiliteEnum.enumValues,
);
export type DocumentVisibiliteType = z.infer<typeof documentVisibiliteSchema>;
