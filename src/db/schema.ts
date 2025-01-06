import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const typeBatimentEnum = pgEnum("typebatiment", [
  "bureaux",
  "localCommercial",
  "entrepot",
  "cabinetMedical",
]);
export const gammeEnum = pgEnum("gamme", [
  "essentiel",
  "confort",
  "excellence",
]);
export const typePropreteEnum = pgEnum("typeproprete", [
  "emp",
  "savon",
  "ph",
  "desinfectant",
  "parfum",
  "balai",
  "poubelle",
]);

export const fournisseurs = pgTable("fournisseurs", {
  id: serial().primaryKey(),
  nomEntreprise: varchar("nom_entreprise").notNull(),
  siret: varchar().notNull(),
  prenomContact: varchar("prenom_contact").notNull(),
  nomContact: varchar("nom_contact").notNull(),
  emailContact: varchar("email_contact").unique().notNull(),
  phoneContact: varchar("phone_contact").notNull(),
  dateChiffrage: date("date_chiffrage", { mode: "string" }).notNull(),
  status: statusEnum().notNull().default("active"),
  slogan: varchar(),
  logoId: integer("logo_id").references(() => logosFournisseurs.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial().primaryKey(),
  nomEntreprise: varchar("nom_entreprise").notNull(),
  siret: varchar().notNull(),
  prenomContact: varchar("prenom_contact").notNull(),
  nomContact: varchar("nom_contact").notNull(),
  emailContact: varchar("email_contact").unique().notNull(),
  phoneContact: varchar("phone_contact").notNull(),
  surface: integer().notNull(),
  effectif: integer().notNull(),
  typeBatiment: typeBatimentEnum().notNull(),
  adresseLigne1: varchar("adresse_ligne_1").notNull(),
  adresseLigne2: varchar("adresse_ligne_2"),
  codePostal: varchar("code_postal").notNull(),
  ville: varchar().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const logosFournisseurs = pgTable("logos_fournisseurs", {
  id: serial().primaryKey(),
  url: varchar().notNull(),
  type: varchar().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//NETTOYAGE ET PROPRETE
export const nettoyageQuantites = pgTable("nettoyage_quantites", {
  id: serial().primaryKey(),
  freqAnnuelle: integer("freq_annuelle").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const nettoyageTarifs = pgTable("nettoyage_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  hParPassage: integer("h_par_passage").notNull(),
  tauxHoraire: integer("taux_horaire").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const nettoyageRepasseTarifs = pgTable("nettoyage_repasse_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  hParPassage: integer("h_par_passage").notNull(),
  tauxHoraire: integer("taux_horaire").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const nettoyageVitrerieTarifs = pgTable("nettoyage_vitrerie_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  cadenceVitres: integer("cadence_vitres").notNull(),
  cadenceCloisons: integer("cadence_cloisons").notNull(),
  tauxHoraire: integer("taux_horaire").notNull(),
  minFacturation: integer("min_facturation").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propreteDistribQuantites = pgTable("proprete_distrib_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  nbDistribEmp: integer("nb_distrib_emp").notNull(),
  nbDistribSavon: integer("nb_distrib_savon").notNull(),
  nbDistribPh: integer("nb_distrib_ph").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propreteDistribTarifs = pgTable("proprete_distrib_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typePropreteEnum().notNull(),
  gamme: gammeEnum().notNull(),
  oneShot: integer("one_shot"),
  pa12M: integer("pa_12m"),
  pa24M: integer("pa_24m"),
  pa36M: integer("pa_36m"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propreteInstalDistribTarifs = pgTable(
  "proprete_instal_distrib_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixInstallation: integer("prix_installation").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const propreteConsoTarifs = pgTable("proprete_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  paParPersonneEmp: integer("pa_par_personne_emp").notNull(),
  paParPersonneSavon: integer("pa_par_personne_savon").notNull(),
  paParPersonnePh: integer("pa_par_personne_ph").notNull(),
  paParPersonneDesinfectant: integer("pa_par_personne_desinfectant").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//RELATIONS
export const fournisseursRelations = relations(
  fournisseurs,
  ({ one, many }) => ({
    logosFournisseur: one(logosFournisseurs, {
      fields: [fournisseurs.logoId],
      references: [logosFournisseurs.id],
    }),
    nettoyageTarifs: many(nettoyageTarifs),
    nettoyageRepasseTarifs: many(nettoyageRepasseTarifs),
    nettoyageVitrerieTarifs: many(nettoyageVitrerieTarifs),
    propreteDistribTarifs: many(propreteDistribTarifs),
    propreteInstalDistribTarifs: many(propreteInstalDistribTarifs),
    propreteConsoTarifs: many(propreteConsoTarifs),
  })
);

export const logosFournisseursRelations = relations(
  logosFournisseurs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [logosFournisseurs.id],
      references: [fournisseurs.logoId],
    }),
  })
);

export const nettoyageTarifsRelations = relations(
  nettoyageTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const nettoyageRepasseTarifsRelations = relations(
  nettoyageRepasseTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageRepasseTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const nettoyageVitrerieTarifsRelations = relations(
  nettoyageVitrerieTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageVitrerieTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const propreteDistribTarifsRelations = relations(
  propreteDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [propreteDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const propreteInstalDistribTarifsRelations = relations(
  propreteInstalDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [propreteInstalDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const propreteConsoTarifsRelations = relations(
  propreteConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [propreteConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);
