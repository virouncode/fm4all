import { relations } from "drizzle-orm";
import {
  boolean,
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
export const typeHygieneEnum = pgEnum("typehygiene", [
  "emp",
  "savon",
  "ph",
  "desinfectant",
  "parfum",
  "balai",
  "poubelle",
]);
export const typeOccupationEnum = pgEnum("typeoccupation", [
  "partieEtage",
  "plateauComplet",
  "batimentEntier",
]);
export const possibiliteEnum = pgEnum("possibilite", [
  "possible",
  "non",
  "obligatoire",
]);

export const typeMachineEnum = pgEnum("typemachine", [
  "cafe",
  "lait",
  "chocolat",
]);

export const fournisseurs = pgTable("fournisseurs", {
  id: serial().primaryKey(),
  nomFournisseur: varchar("nom_fournisseur").notNull(),
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
  nomFournisseur: varchar("nom_fournisseur").notNull(),
  siret: varchar().notNull(),
  prenomContact: varchar("prenom_contact").notNull(),
  nomContact: varchar("nom_contact").notNull(),
  posteContact: varchar("poste_contact"),
  emailContact: varchar("email_contact").unique().notNull(),
  phoneContact: varchar("phone_contact").notNull(),
  surface: integer().notNull(),
  effectif: integer().notNull(),
  typeBatiment: typeBatimentEnum().notNull(),
  typeOccupation: typeOccupationEnum().notNull(),
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

//NETTOYAGE
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

//HYGIENE
export const hygieneDistribQuantites = pgTable("hygiene_distrib_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  nbDistribEmp: integer("nb_distrib_emp").notNull(),
  nbDistribSavon: integer("nb_distrib_savon").notNull(),
  nbDistribPh: integer("nb_distrib_ph").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hygieneDistribTarifs = pgTable("hygiene_distrib_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeHygieneEnum().notNull(),
  gamme: gammeEnum().notNull(),
  oneShot: integer("one_shot"),
  pa12M: integer("pa_12m"),
  pa24M: integer("pa_24m"),
  pa36M: integer("pa_36m"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hygieneInstalDistribTarifs = pgTable(
  "hygiene_instal_distrib_tarifs",
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

export const hygieneConsoTarifs = pgTable("hygiene_conso_tarifs", {
  id: serial().primaryKey(),
  effectif: integer(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  paParPersonneEmp: integer("pa_par_personne_emp").notNull(),
  paParPersonneSavon: integer("pa_par_personne_savon").notNull(),
  paParPersonnePh: integer("pa_par_personne_ph").notNull(),
  paParPersonneDesinfectant: integer("pa_par_personne_desinfectant").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//INCENDIE
export const incendieQuantites = pgTable("incendie_quantites", {
  id: serial().primaryKey(),
  surface: integer().notNull(),
  nbExtincteurs: integer("nb_extincteurs").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const incendieTarifs = pgTable("incendie_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixParExtincteur: integer("prix_par_extincteur").notNull(),
  prixParBaes: integer("prix_par_baes").notNull(),
  prixParTelBaes: integer("prix_par_tel_baes").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//MAINTENANCE
export const maintenanceQuantites = pgTable("maintenance_quantites", {
  id: serial().primaryKey(),
  surface: integer().notNull(),
  freqAnnuelle: integer("freq_annuelle").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const maintenanceTarifs = pgTable("maintenance_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  hParPassage: integer("h_par_passage").notNull(),
  tauxHoraire: integer("taux_horaire").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//CAFE
export const cafeQuantites = pgTable("cafe_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  nbCafesParAn: integer("nb_cafes_par_an").notNull(),
  nbMachines: integer("nb_machines").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cafeMachines = pgTable("cafe_machines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  nbBoissons: integer("nb_boissons").notNull(),
  nbTassesParJ: integer("nb_tasses_par_j").notNull(),
  arriveeReseau: possibiliteEnum("arrivee_reseau").notNull(),
  evacuationReseau: possibiliteEnum("evacuation_reseau").notNull(),
  evacuationMarc: possibiliteEnum("evacuation_marc").notNull(),
  lactee: boolean().notNull(),
  gourmande: boolean().notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cafeMachinesTarifs = pgTable("cafe_machines_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeMachineEnum().notNull(),
  limiteTassesJ: integer("limite_tasses_j").notNull(),
  prixInstallation: integer("prix_installation"),
  oneShot: integer("one_shot"),
  pa12M: integer("pa_12m"),
  pa24M: integer("pa_24m"),
  pa36M: integer("pa_36m"),
  pa48M: integer("pa_48m"),
  pa60M: integer("pa_60m"),
  rac12M: integer("rac_12m"),
  rac24M: integer("rac_24m"),
  paMaintenance: integer("pa_maintenance"),
  cafeMachineId: integer("cafe_machine_id").references(() => cafeMachines.id),
  reconditionne: boolean().default(false),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cafeConsoTarifs = pgTable("cafe_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const laitConsoTarifs = pgTable("lait_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer().notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chocoConsoTarifs = pgTable("choco_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer().notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const theConsoTarifs = pgTable("the_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fruitsQuantites = pgTable("fruits_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  kgParSemaine: integer("kg_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tempfruitsQuantites = pgTable("temp_fruits_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  kgParSemaine: integer("kg_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fruitsTarifs = pgTable("fruits_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixKg: integer("prix_kg"),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const snacksQuantites = pgTable("snacks_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  portionsParSemaine: integer("portions_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const snacksTarifs = pgTable("snacks_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const boissonsQuantites = pgTable("boissons_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  consosParSemaine: integer("consos_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const boissonsTarifs = pgTable("boissons_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const foodLivraisonTarifs = pgTable("food_livraison_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  freqAnnuelle: integer("freq_annuelle").notNull(),
  panierMin: integer("panier_min"),
  prixUnitaire: integer("prix_unitaire").notNull(),
  prixUnitaireSiCafe: integer("prix_unitaire_si_cafe").notNull(),
  seuilFranco: integer("seuil_franco"),
  remise_si_cafe: integer("remise_si_cafe"),
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
    hygieneDistribTarifs: many(hygieneDistribTarifs),
    hygieneInstalDistribTarifs: many(hygieneInstalDistribTarifs),
    hygieneConsoTarifs: many(hygieneConsoTarifs),
    incendieTarifs: many(incendieTarifs),
    maintenanceTarifs: many(maintenanceTarifs),
    cafeMachinesTarifs: many(cafeMachinesTarifs),
    cafeConsoTarifs: many(cafeConsoTarifs),
    laitConsoTarifs: many(laitConsoTarifs),
    chocoConsoTarifs: many(chocoConsoTarifs),
    theConsoTarifs: many(theConsoTarifs),
    fruitsTarifs: many(fruitsTarifs),
    snacksTarifs: many(snacksTarifs),
    boissonsTarifs: many(boissonsTarifs),
    foodLivraisonTarifs: many(foodLivraisonTarifs),
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

export const hygieneDistribTarifsRelations = relations(
  hygieneDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const hygieneInstalDistribTarifsRelations = relations(
  hygieneInstalDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneInstalDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const hygieneConsoTarifsRelations = relations(
  hygieneConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const incendieTarifsRelations = relations(incendieTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [incendieTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const maintenanceTarifsRelations = relations(
  maintenanceTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [maintenanceTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);
export const cafeMachinesRelations = relations(cafeMachines, ({ many }) => ({
  cafeMachinesTarif: many(cafeMachinesTarifs),
}));

export const cafeMachinesTarifsRelations = relations(
  cafeMachinesTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [cafeMachinesTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
    cafeMachine: one(cafeMachines),
  })
);

export const cafeConsoTarifsRelations = relations(
  cafeConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [cafeConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const theConsoTarifsRelations = relations(theConsoTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [theConsoTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const laitConsoTarifsRelations = relations(
  laitConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [laitConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const chocoConsoTarifsRelations = relations(
  chocoConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [chocoConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const fruitsTarifsRelations = relations(fruitsTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [fruitsTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const snacksTarifsRelations = relations(snacksTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [snacksTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const boissonsTarifsRelations = relations(boissonsTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [boissonsTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const foodLivraisonTarifsRelations = relations(
  foodLivraisonTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [foodLivraisonTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);
