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
  "poubelleEmp",
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

export const typeLaitEnum = pgEnum("typelait", ["dosettes", "frais", "poudre"]);
export const typeChocolatEnum = pgEnum("typechocolat", ["sachets", "poudre"]);

export const inclusEnum = pgEnum("inclus", [
  "inclus",
  "non inclus",
  "non propose",
  "sur demande",
]);

export const typePorteEnum = pgEnum("typeporte", ["vantaux", "coulissante"]);
export const typeColonneEnum = pgEnum("typecolonne", ["statique", "dynamique"]);
export const typeEau = pgEnum("typeeau", ["EF", "EC", "EG", "ECG"]);
export const typePose = pgEnum("typepose", ["aposer", "colonne", "comptoir"]);

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
  nomEntreprise: varchar("nom_entreprise").notNull(),
  siret: varchar(),
  prenomContact: varchar("prenom_contact").notNull(),
  nomContact: varchar("nom_contact").notNull(),
  posteContact: varchar("poste_contact").notNull(),
  emailContact: varchar("email_contact").notNull(),
  phoneContact: varchar("phone_contact").notNull(),
  prenomSignataire: varchar("prenom_signataire"),
  nomSignataire: varchar("nom_signataire"),
  posteSignataire: varchar("poste_signataire"),
  emailSignataire: varchar("email_signataire"),
  surface: integer().notNull(),
  effectif: integer().notNull(),
  typeBatiment: typeBatimentEnum().notNull(),
  typeOccupation: typeOccupationEnum().notNull(),
  adresseLigne1: varchar("adresse_ligne_1"),
  adresseLigne2: varchar("adresse_ligne_2"),
  codePostal: varchar("code_postal").notNull(),
  ville: varchar().notNull(),
  dateDeDemarrage: date("date_de_demarrage", { mode: "string" }),
  commentaires: varchar(),
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

export const legioTarifs = pgTable("legio_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const q18Tarifs = pgTable("q18_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const qualiteAirTarifs = pgTable("qualite_air_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
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

export const exutoiresTarifs = pgTable("exutoires_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  nbExutoires: integer("nb_exutoires").notNull(),
  prixParExutoire: integer("prix_par_exutoire").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exutoiresParkingTarifs = pgTable("exutoires_parking_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  nbExutoires: integer("nb_exutoires").notNull(),
  prixParExutoire: integer("prix_par_exutoire").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const alarmesTarifs = pgTable("alarmes_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  nbPoints: integer("nb_points").notNull(),
  prixParControle: integer("prix_par_controle").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portesCoupeFeuTarifs = pgTable("portes_coupe_feu_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typePorteEnum().notNull(),
  prixParPorte: integer("prix_par_porte").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const riaTarifs = pgTable("ria_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  prixParRIA: integer("prix_par_ria").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const colonnesSechesTarifs = pgTable("colonnes_seches_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeColonneEnum().notNull(),
  prixParColonne: integer("prix_par_colonne").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//CAFE
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
  nbPersonnes: integer("nb_personnes").notNull(),
  nbMachines: integer("nb_machines"),
  typeLait: typeLaitEnum("type_lait"),
  typeChocolat: typeChocolatEnum("type_chocolat"),
  oneShot: integer("one_shot"),
  pa12M: integer("pa_12m"),
  rac12M: integer("rac_12m"),
  pa24M: integer("pa_24m"),
  rac24M: integer("rac_24m"),
  pa36M: integer("pa_36m"),
  pa48M: integer("pa_48m"),
  paMaintenance: integer("pa_maintenance"),
  nbPassages: integer("nb_passages"),
  fraisInstallation: integer("frais_installation"),
  cafeMachineId: integer("cafe_machine_id").references(() => cafeMachines.id),
  infos: varchar(),
  reconditionne: boolean().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cafeConsoTarifs = pgTable("cafe_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
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
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const laitConsoTarifs = pgTable("lait_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaireDosette: integer("prix_unitaire_dosette"),
  prixUnitaireFrais: integer("prix_unitaire_frais"),
  prixUnitairePoudre: integer("prix_unitaire_poudre"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chocolatConsoTarifs = pgTable("chocolat_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaireSachet: integer("prix_unitaire_sachet"),
  prixUnitairePoudre: integer("prix_unitaire_poudre"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sucreConsoTarifs = pgTable("sucre_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//SNACKS FRUITS BOISSONS
export const fruitsQuantites = pgTable("fruits_quantites", {
  id: serial().primaryKey(),
  gParSemaineParPersonne: integer("g_par_semaine_par_personne").notNull(),
  minKgParSemaine: integer("min_kg_par_semaine").notNull(),
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
  portionsParSemaineParPersonne: integer(
    "portions_par_semaine_par_personne"
  ).notNull(),
  minPortionsParSemaine: integer("min_portions_par_semaine").notNull(),
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
  consosParSemaineParPersonne: integer(
    "consos_par_semaine_par_personne"
  ).notNull(),
  gamme: gammeEnum().notNull(),
  minConsosParSemaine: integer("min_consos_par_semaine").notNull(),
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

//FONTAINES
export const fontaines = pgTable("fontaines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const fontainesTarifs = pgTable("fontaines_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeEau().notNull(),
  typePose: typePose("type_pose").notNull(),
  nbPersonnes: integer("nb_personnes").notNull(),
  oneShot: integer("one_shot"),
  pa12M: integer("pa_12m"),
  rac12M: integer("rac_12m"),
  pa24M: integer("pa_24m"),
  rac24M: integer("rac_24m"),
  pa36M: integer("pa_36m"),
  pa48M: integer("pa_48m"),
  pa60M: integer("pa_60m"),
  paMaintenance: integer("pa_maintenance"),
  fraisInstallation: integer("frais_installation"),
  paConsoFiltres: integer("pa_conso_filtres"),
  paConsoCO2: integer("pa_conso_co2"),
  paConsoEauChaude: integer("pa_conso_eau_chaude"),
  fontaineId: integer("fontaine_id").references(() => fontaines.id),
  reconditionne: boolean().default(false),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const officeManagerQuantites = pgTable("office_manager_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  demiJParSemaine: integer("demi_j_par_semaine").notNull(),
  majoration: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const officeManagerTarifs = pgTable("office_manager_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  demiTjm: integer("demi_tjm").notNull(),
  demiTjmPremium: integer("demi_tjm_premium").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servicesFm4AllTaux = pgTable("services_fm4all_taux", {
  id: serial().primaryKey(),
  assurance: integer().notNull(),
  plateforme: integer().notNull(),
  minFacturationPlateforme: integer("min_facturation_plateforme").notNull(),
  supportAdmin: integer("support_admin").notNull(),
  supportOp: integer("support_op").notNull(),
  minFacturationSupportOp: integer("min_facturation_support_op").notNull(),
  accountManager: integer("account_manager").notNull(),
  minFacturationAccountManager: integer(
    "min_facturation_account_manager"
  ).notNull(),
  remiseCaSeuil: integer("remise_ca_seuil").notNull(),
  remiseCa: integer("remise_ca").notNull(),
  remiseHof: integer("remise_hof").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servicesFm4AllOffres = pgTable("services_fm4all_offres", {
  id: serial().primaryKey(),
  gamme: gammeEnum().notNull(),
  assurance: inclusEnum().notNull(),
  plateforme: inclusEnum().notNull(),
  supportAdmin: inclusEnum("support_admin").notNull(),
  supportOp: inclusEnum("support_op").notNull(),
  accountManager: inclusEnum("account_manager").notNull(),
  audit: inclusEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const devis = pgTable("devis", {
  id: serial().primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  texte: varchar().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//RELATIONS
export const clientsRelations = relations(clients, ({ many }) => ({
  devis: many(devis),
}));
export const fournisseursRelations = relations(
  fournisseurs,
  ({ one, many }) => ({
    logosFournisseur: one(logosFournisseurs, {
      fields: [fournisseurs.logoId],
      references: [logosFournisseurs.id],
    }),
    officeManagerTarif: one(officeManagerTarifs, {
      fields: [fournisseurs.id],
      references: [officeManagerTarifs.fournisseurId],
    }),
    nettoyageTarifs: many(nettoyageTarifs),
    nettoyageRepasseTarifs: many(nettoyageRepasseTarifs),
    nettoyageVitrerieTarifs: many(nettoyageVitrerieTarifs),
    hygieneDistribTarifs: many(hygieneDistribTarifs),
    hygieneInstalDistribTarifs: many(hygieneInstalDistribTarifs),
    hygieneConsoTarifs: many(hygieneConsoTarifs),
    incendieTarifs: many(incendieTarifs),
    exutoiresTarifs: many(exutoiresTarifs),
    exutoiresParkingTarifs: many(exutoiresParkingTarifs),
    alarmesTarifs: many(alarmesTarifs),
    portesCoupeFeuTarifs: many(portesCoupeFeuTarifs),
    riaTarifs: many(riaTarifs),
    colonnesSechesTarifs: many(colonnesSechesTarifs),
    maintenanceTarifs: many(maintenanceTarifs),
    legioTarifs: many(legioTarifs),
    q18Tarifs: many(q18Tarifs),
    qualiteAirTarifs: many(qualiteAirTarifs),
    cafeMachinesTarifs: many(cafeMachinesTarifs),
    cafeConsoTarifs: many(cafeConsoTarifs),
    laitConsoTarifs: many(laitConsoTarifs),
    chocoConsoTarifs: many(chocolatConsoTarifs),
    theConsoTarifs: many(theConsoTarifs),
    sucreConsoTarifs: many(sucreConsoTarifs),
    fruitsTarifs: many(fruitsTarifs),
    snacksTarifs: many(snacksTarifs),
    boissonsTarifs: many(boissonsTarifs),
    foodLivraisonTarifs: many(foodLivraisonTarifs),
    fontainesTarifs: many(fontainesTarifs),
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

export const exutoiresTarifsRelations = relations(
  exutoiresTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [exutoiresTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const exutoiresParkingTarifsRelations = relations(
  exutoiresParkingTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [exutoiresParkingTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const alarmesTarifsRelations = relations(alarmesTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [alarmesTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const portesCoupeFeuTarifsRelations = relations(
  portesCoupeFeuTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [portesCoupeFeuTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const riaTarifsRelations = relations(riaTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [riaTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const colonnesSechesTarifsRelations = relations(
  colonnesSechesTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [colonnesSechesTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const maintenanceTarifsRelations = relations(
  maintenanceTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [maintenanceTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const legioTarifsRelations = relations(legioTarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [legioTarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const q18TarifsRelations = relations(q18Tarifs, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [q18Tarifs.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const qualiteAirTarifsRelations = relations(
  qualiteAirTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [qualiteAirTarifs.fournisseurId],
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

export const chocolatConsoTarifsRelations = relations(
  chocolatConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [chocolatConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const sucreConsoTarifsRelations = relations(
  sucreConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [sucreConsoTarifs.fournisseurId],
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

export const fontainesRelations = relations(fontaines, ({ many }) => ({
  fontainesTarif: many(fontainesTarifs),
}));

export const fontainesTarifsRelations = relations(
  fontainesTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [fontainesTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
    fontaine: one(fontaines),
  })
);

export const officeManagerTarifsRelations = relations(
  officeManagerTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [officeManagerTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  })
);

export const devisRelations = relations(devis, ({ one }) => ({
  client: one(clients, {
    fields: [devis.clientId],
    references: [clients.id],
  }),
}));
