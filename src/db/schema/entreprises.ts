import {
  AnyPgColumn,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./auth";
import { documents } from "./documents";
import { roleEntrepriseEnum } from "./enums";
import { prospects } from "./prospects";
import { services } from "./services";

export const entreprises = pgTable(
  "entreprises",
  {
    id: id(),
    nom: text("nom").notNull(),
    siret: text("siret").notNull().unique(),
    prospectId: uuid("prospect_id").references(() => prospects.id, {
      onDelete: "set null",
    }),
    prenomContact: text("prenom_contact"),
    nomContact: text("nom_contact"),
    emailContact: text("email_contact"),
    phoneContact: text("telephone_contact"),
    logoId: uuid("logo_id").references((): AnyPgColumn => documents.id, {
      onDelete: "set null",
    }),
    numeroTva: text("numero_tva"),
    createdById: uuid("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: uuid("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // siret est unique() → index implicite
    index("entreprises_prospect_id_idx").on(table.prospectId),
    index("entreprises_created_at_idx").on(table.createdAt),
  ],
);

export const entrepriseRoles = pgTable(
  "entreprise_roles",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    role: roleEntrepriseEnum("role").notNull(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("entreprise_roles_entreprise_id_idx").on(table.entrepriseId),
    uniqueIndex("entreprise_roles_entreprise_role_udx").on(
      table.entrepriseId,
      table.role,
    ),
  ],
);

export const clientPrestataireRelations = pgTable(
  "client_prestataire_relations",
  {
    id: id(),
    clientEntrepriseId: uuid("client_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    prestataireEntrepriseId: uuid("prestataire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cpr_client_id_idx").on(table.clientEntrepriseId),
    index("cpr_prestataire_id_idx").on(table.prestataireEntrepriseId),
    uniqueIndex("cpr_client_prestataire_udx").on(
      table.clientEntrepriseId,
      table.prestataireEntrepriseId,
    ),
  ],
);

export const entrepriseInvitations = pgTable(
  "entreprise_invitations",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("ei_entreprise_id_idx").on(table.entrepriseId),
    index("ei_token_idx").on(table.token),
  ],
);

export const serviceEntreprises = pgTable(
  "service_entreprises",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
      }),
    actif: boolean("actif").notNull().default(true),
    notes: text("notes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("service_entreprises_entreprise_id_idx").on(table.entrepriseId),
    index("service_entreprises_service_id_idx").on(table.serviceId),
    uniqueIndex("service_entreprises_entreprise_service_udx").on(
      table.entrepriseId,
      table.serviceId,
    ),
  ],
);
