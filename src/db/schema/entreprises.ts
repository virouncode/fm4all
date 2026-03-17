import {
  AnyPgColumn,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
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
import {
  clientPrestataireContactSideEnum,
  invitationTypeAdhesionEnum,
  roleEntrepriseEnum,
} from "./enums";
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
    logoId: uuid("logo_id").references((): AnyPgColumn => documents.id, {
      onDelete: "set null",
    }),
    numeroTva: text("numero_tva"),
    adresseLigne1: text("adresse_ligne1"),
    adresseLigne2: text("adresse_ligne2"),
    codePostal: varchar("code_postal", { length: 10 }),
    ville: varchar("ville"),
    formeJuridique: varchar("forme_juridique"),
    sireneSyncedAt: timestamp("sirene_synced_at", { withTimezone: true }),
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

export const contactsInvitations = pgTable(
  "contacts_invitations",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    typeAdhesion: invitationTypeAdhesionEnum("type_adhesion").notNull(),
    // Lien optionnel vers le contact source (null pour les invitations admin legacy)
    contactId: uuid("contact_id").references(
      (): AnyPgColumn => entrepriseContacts.id,
      { onDelete: "set null" },
    ),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("ci_entreprise_id_idx").on(table.entrepriseId),
    index("ci_token_idx").on(table.token),
    index("ci_contact_id_idx").on(table.contactId),
  ],
);

/**
 * @deprecated Use contactsInvitations instead.
 * Kept for backward compatibility with existing admin invitation flow.
 */
export const entrepriseInvitations = contactsInvitations;

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
    index("service_entreprises_actif_idx").on(table.actif),
    uniqueIndex("service_entreprises_entreprise_service_udx").on(
      table.entrepriseId,
      table.serviceId,
    ),
  ],
);

/**
 * Contacts d'une entreprise (personnes physiques associées à l'entreprise).
 * Une personne peut avoir ou non un compte utilisateur (userId nullable).
 * Remplace les anciens champs prenomContact/nomContact/emailContact/phoneContact sur entreprises.
 */
export const entrepriseContacts = pgTable(
  "entreprise_contacts",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    prenom: text("prenom").notNull(),
    nom: text("nom").notNull(),
    email: text("email"),
    phone: text("phone"),
    fonction: text("fonction"),
    notes: text("notes"),
    // Lien optionnel vers un compte utilisateur
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("entreprise_contacts_entreprise_id_idx").on(table.entrepriseId),
    index("entreprise_contacts_user_id_idx").on(table.userId),
  ],
);

/**
 * Interlocuteurs dédiés par relation client↔prestataire.
 * Remplace les anciens champs inline sur clientPrestataireRelations.
 * Un contact peut être du côté client ou prestataire de la relation.
 * Plusieurs contacts peuvent être liés à une même relation.
 */
export const clientPrestataireRelationContacts = pgTable(
  "client_prestataire_relation_contacts",
  {
    id: id(),
    relationId: uuid("relation_id")
      .notNull()
      .references(() => clientPrestataireRelations.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => entrepriseContacts.id, { onDelete: "cascade" }),
    // "client" = interlocuteur chez le client (saisi par le prestataire)
    // "prestataire" = interlocuteur chez le prestataire (saisi par le client)
    side: clientPrestataireContactSideEnum("side").notNull(),
    role: text("role"), // ex: "Responsable compte", "Contact facturation"
    estPrincipal: boolean("est_principal").notNull().default(false),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cprc_relation_id_idx").on(table.relationId),
    index("cprc_contact_id_idx").on(table.contactId),
    uniqueIndex("cprc_relation_contact_udx").on(table.relationId, table.contactId),
  ],
);
