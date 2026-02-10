import { index, integer, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { gammeEnum, inclusEnum } from "./enums";

export const servicesFm4AllTaux = pgTable("services_fm4all_taux", {
  id: id(),
  assurance: integer().notNull(),
  plateforme: integer().notNull(),
  minFacturationPlateforme: integer("min_facturation_plateforme").notNull(),
  supportAdmin: integer("support_admin").notNull(),
  supportOp: integer("support_op").notNull(),
  minFacturationSupportOp: integer("min_facturation_support_op").notNull(),
  accountManager: integer("account_manager").notNull(),
  minFacturationAccountManager: integer(
    "min_facturation_account_manager",
  ).notNull(),
  remiseCaSeuil: integer("remise_ca_seuil").notNull(),
  remiseCa: integer("remise_ca").notNull(),
  remiseHof: integer("remise_hof").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const servicesFm4AllOffres = pgTable(
  "services_fm4all_offres",
  {
    id: id(),
    gamme: gammeEnum().notNull(),
    assurance: inclusEnum().notNull(),
    plateforme: inclusEnum().notNull(),
    supportAdmin: inclusEnum("support_admin").notNull(),
    supportOp: inclusEnum("support_op").notNull(),
    accountManager: inclusEnum("account_manager").notNull(),
    audit: inclusEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("services_fm4all_offres_gamme_idx").on(table.gamme)],
);
