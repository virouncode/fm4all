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

import { updatedAt } from "./schema-helper";

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

export const typeHygieneDistribEnum = pgEnum("typehygienedistrib", [
  "emp",
  "poubelleEmp",
  "savon",
  "ph",
  "desinfectant",
  "parfum",
  "balai",
  "poubelle",
]);

export const typeHygieneConsoEnum = pgEnum("typehygieneconso", [
  "emp",
  "savon",
  "ph",
  "desinfectant",
]);

export const typePorteCoupeFeuEnum = pgEnum("typeportecoupefeu", [
  "vantaux",
  "coulissante",
]);

export const typeColonneSecheEnum = pgEnum("typecolonneseche", [
  "statique",
  "dynamique",
]);

export const typeOfficeManagerEnum = pgEnum("typeofficemanager", [
  "standard",
  "premium",
]);

export const typeOccupationEnum = pgEnum("typeoccupation", [
  "partieEtage",
  "plateauComplet",
  "batimentEntier",
]);
export const typeLocationEnum = pgEnum("typelocation", [
  "oneShot",
  "12m",
  "24m",
  "36m",
  "48m",
  "60m",
]);
export const typeIncendieTrilogieEnum = pgEnum("typeincendietrilogie", [
  "extincteur",
  "baes",
  "telBaes",
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
export const roleEnum = pgEnum("role", ["admin", "fournisseur", "client"]);

export const fournisseurs = pgTable("fournisseurs", {
  id: serial().primaryKey(),
  nomFournisseur: varchar("nom_fournisseur").notNull(),
  siret: varchar().notNull(),
  prenomContact: varchar("prenom_contact").notNull(),
  nomContact: varchar("nom_contact").notNull(),
  emailContact: varchar("email_contact").unique().notNull(),
  phoneContact: varchar("phone_contact").notNull(),
  dateChiffrage: date("date_chiffrage", { mode: "string" }),
  status: statusEnum().notNull().default("active"),
  slogan: varchar(),
  presentation: varchar(),
  logoUrl: varchar("logo_url"),
  locationUrl: varchar("location_url"),
  anneeCreation: integer("annee_creation"),
  ca: varchar(),
  effectif: varchar(),
  nbClients: integer("nb_clients"),
  noteGoogle: varchar("note_google"),
  nbAvis: integer("nb_avis"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  updatedAt,
});

export const logosFournisseurs = pgTable("logos_fournisseurs", {
  id: serial().primaryKey(),
  url: varchar().notNull(),
  type: varchar().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//SERVICES
export const services = pgTable("services", {
  id: serial().primaryKey(),
  nom: varchar("nom").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const servicesFournisseurs = pgTable("services_fournisseurs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//NETTOYAGE
export const nettoyageQuantites = pgTable("nettoyage_quantites", {
  id: serial().primaryKey(),
  freqAnnuelle: integer("freq_annuelle").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//HYGIENE
export const hygieneDistribQuantites = pgTable("hygiene_distrib_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  nbDistribEmp: integer("nb_distrib_emp").notNull(),
  nbDistribSavon: integer("nb_distrib_savon").notNull(),
  nbDistribPh: integer("nb_distrib_ph").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const hygieneMinFacturation = pgTable("hygiene_min_facturation", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  minFacturation: integer("min_facturation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
    updatedAt,
  },
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});
//MAINTENANCE
export const maintenanceQuantites = pgTable("maintenance_quantites", {
  id: serial().primaryKey(),
  surface: integer().notNull(),
  freqAnnuelle: integer("freq_annuelle").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const legioTarifs = pgTable("legio_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const q18Tarifs = pgTable("q18_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const qualiteAirTarifs = pgTable("qualite_air_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  prixAnnuel: integer("prix_annuel").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//INCENDIE
export const incendieQuantites = pgTable("incendie_quantites", {
  id: serial().primaryKey(),
  surface: integer().notNull(),
  nbExtincteurs: integer("nb_extincteurs").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  updatedAt,
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
  updatedAt,
});

export const alarmesTarifs = pgTable("alarmes_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  nbPoints: integer("nb_points").notNull(),
  prixParControle: integer("prix_par_controle").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const portesCoupeFeuTarifs = pgTable("portes_coupe_feu_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typePorteEnum().notNull(),
  prixParPorte: integer("prix_par_porte").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const riaTarifs = pgTable("ria_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  prixParRIA: integer("prix_par_ria").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const colonnesSechesTarifs = pgTable("colonnes_seches_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeColonneEnum().notNull(),
  prixParColonne: integer("prix_par_colonne").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  reconditionne: boolean().default(false),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const cafeConsoTarifs = pgTable("cafe_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const theConsoTarifs = pgTable("the_conso_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  updatedAt,
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
  updatedAt,
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
  updatedAt,
});

//SNACKS FRUITS BOISSONS
export const fruitsQuantites = pgTable("fruits_quantites", {
  id: serial().primaryKey(),
  gParSemaineParPersonne: integer("g_par_semaine_par_personne").notNull(),
  minKgParSemaine: integer("min_kg_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const fruitsTarifs = pgTable("fruits_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixKg: integer("prix_kg"),
  gamme: gammeEnum().notNull(),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const snacksQuantites = pgTable("snacks_quantites", {
  id: serial().primaryKey(),
  portionsParSemaineParPersonne: integer(
    "portions_par_semaine_par_personne",
  ).notNull(),
  minPortionsParSemaine: integer("min_portions_par_semaine").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const snacksTarifs = pgTable("snacks_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  gamme: gammeEnum().notNull(),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const boissonsQuantites = pgTable("boissons_quantites", {
  id: serial().primaryKey(),
  consosParSemaineParPersonne: integer(
    "consos_par_semaine_par_personne",
  ).notNull(),
  gamme: gammeEnum().notNull(),
  minConsosParSemaine: integer("min_consos_par_semaine").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const boissonsTarifs = pgTable("boissons_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  gamme: gammeEnum().notNull(),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  remiseSiCafe: integer("remise_si_cafe"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//FONTAINES
export const fontaines = pgTable("fontaines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const officeManagerQuantites = pgTable("office_manager_quantites", {
  id: serial().primaryKey(),
  effectif: integer().notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  demiJParSemaine: integer("demi_j_par_semaine").notNull(),
  majoration: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const officeManagerTarifs = pgTable("office_manager_tarifs", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  demiTjm: integer("demi_tjm").notNull(),
  demiTjmPremium: integer("demi_tjm_premium").notNull(),
  imageUrl: varchar("image_url"),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
    "min_facturation_account_manager",
  ).notNull(),
  remiseCaSeuil: integer("remise_ca_seuil").notNull(),
  remiseCa: integer("remise_ca").notNull(),
  remiseHof: integer("remise_hof").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
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
  updatedAt,
});
export const devisTemporaires = pgTable("devis_temporaires", {
  id: serial().primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  texte: varchar().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const devis = pgTable("devis", {
  id: serial().primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  devisUrl: varchar("devis_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

//AUTH
import { text } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: roleEnum("role").default("admin").notNull(),
  fournisseurId: integer("fournisseur_id").references(() => fournisseurs.id),
  clientId: integer("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

//RELATIONS
export const clientsRelations = relations(clients, ({ many }) => ({
  devis: many(devisTemporaires),
}));
export const fournisseursRelations = relations(
  fournisseurs,
  ({ one, many }) => ({
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
  }),
);

export const nettoyageTarifsRelations = relations(
  nettoyageTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const nettoyageRepasseTarifsRelations = relations(
  nettoyageRepasseTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageRepasseTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const nettoyageVitrerieTarifsRelations = relations(
  nettoyageVitrerieTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageVitrerieTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const hygieneDistribTarifsRelations = relations(
  hygieneDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const hygieneMinFacturationRelations = relations(
  hygieneMinFacturation,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneMinFacturation.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const hygieneInstalDistribTarifsRelations = relations(
  hygieneInstalDistribTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneInstalDistribTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const hygieneConsoTarifsRelations = relations(
  hygieneConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
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
  }),
);

export const exutoiresParkingTarifsRelations = relations(
  exutoiresParkingTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [exutoiresParkingTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
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
  }),
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
  }),
);

export const maintenanceTarifsRelations = relations(
  maintenanceTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [maintenanceTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
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
  }),
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
  }),
);

export const cafeConsoTarifsRelations = relations(
  cafeConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [cafeConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
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
  }),
);

export const chocolatConsoTarifsRelations = relations(
  chocolatConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [chocolatConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const sucreConsoTarifsRelations = relations(
  sucreConsoTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [sucreConsoTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
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
  }),
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
  }),
);

export const officeManagerTarifsRelations = relations(
  officeManagerTarifs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [officeManagerTarifs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const devisRelations = relations(devis, ({ one }) => ({
  client: one(clients, {
    fields: [devis.clientId],
    references: [clients.id],
  }),
}));

export const devisTemporairesRelations = relations(
  devisTemporaires,
  ({ one }) => ({
    client: one(clients, {
      fields: [devisTemporaires.clientId],
      references: [clients.id],
    }),
  }),
);

//NEW

export const nettoyageProduits = pgTable("nettoyage_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  hParPassage: integer("h_par_passage").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const nettoyageOffres = pgTable("nettoyage_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => nettoyageProduits.id),
  tauxHoraire: integer("taux_horaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const nettoyageRepasseProduits = pgTable("nettoyage_repasse_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  hParPassage: integer("h_par_passage").notNull(),
  surface: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const nettoyageRepasseOffres = pgTable("nettoyage_repasse_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => nettoyageRepasseProduits.id),
  tauxHoraire: integer("taux_horaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const nettoyageVitrerieProduits = pgTable(
  "nettoyage_vitrerie_produits",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    cadenceVitres: integer("cadence_vitres").notNull(),
    cadenceCloisons: integer("cadence_cloisons").notNull(),
    minFacturation: integer("min_facturation").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt,
  },
);

export const nettoyageVitrerieOffres = pgTable("nettoyage_vitrerie_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => nettoyageVitrerieProduits.id),
  tauxHoraire: integer("taux_horaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const hygieneDistribProduits = pgTable("hygiene_distrib_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeHygieneDistribEnum().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const hygieneDistribOffres = pgTable("hygiene_distrib_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => hygieneDistribProduits.id),
  typeLocation: typeLocationEnum("type_location").notNull(),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const hygieneInstalDistribProduits = pgTable(
  "hygiene_instal_distrib_produits",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt,
  },
);

export const hygieneInstalDistribOffres = pgTable(
  "hygiene_instal_distrib_offres",
  {
    id: serial().primaryKey(),
    produitId: integer("produit_id")
      .notNull()
      .references(() => hygieneInstalDistribProduits.id),
    prixInstallation: integer("prix_installation").notNull(),
    infos: varchar(),
    imageUrl: varchar("image_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt,
  },
);

export const hygieneConsoProduits = pgTable("hygiene_conso_produits", {
  id: serial().primaryKey(),
  effectif: integer(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const hygieneConsoOffres = pgTable("hygiene_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => hygieneConsoProduits.id),
  type: typeHygieneConsoEnum().notNull(),
  paParPersonne: integer("pa_par_personne").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const maintenanceProduits = pgTable("maintenance_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  hParPassage: integer("h_par_passage").notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const maintenanceOffres = pgTable("maintenance_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => maintenanceProduits.id),
  tauxHoraire: integer("taux_horaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const legioProduits = pgTable("legio_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const legioOffres = pgTable("legio_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => legioProduits.id),
  prixAnnuel: integer("prix_annuel").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const q18Produits = pgTable("q18_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const q18Offres = pgTable("q18_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => q18Produits.id),
  prixAnnuel: integer("prix_annuel").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const qualiteAirProduits = pgTable("qualite_air_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const qualiteAirOffres = pgTable("qualite_air_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => qualiteAirProduits.id),
  prixAnnuel: integer("prix_annuel").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const incendieProduits = pgTable("incendie_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  surface: integer().notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const incendieOffres = pgTable("incendie_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => incendieProduits.id),
  type: typeIncendieTrilogieEnum().notNull(),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const exutoiresProduits = pgTable("exutoires_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id"),
  nbExutoires: integer("nb_exutoires").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const exutoiresOffres = pgTable("exutoires_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => exutoiresProduits.id),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const exutoiresParkingProduits = pgTable("exutoires_parking_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id"),
  nbExutoires: integer("nb_exutoires").notNull(),
  fraisDeplacement: integer("frais_deplacement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const exutoiresParkingOffres = pgTable("exutoires_parking_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => exutoiresParkingProduits.id),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const alarmesProduits = pgTable("alarmes_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  nbPoints: integer("nb_points").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const alarmesOffres = pgTable("alarmes_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => alarmesProduits.id),
  prixTotal: integer("prix_total").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const portesCoupeFeuProduits = pgTable("portes_coupe_feu_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typePorteCoupeFeuEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const portesCoupeFeuOffres = pgTable("portes_coupe_feu_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => portesCoupeFeuProduits.id),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const riaProduits = pgTable("ria_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const riaOffres = pgTable("ria_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => riaProduits.id),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const colonnesSechesProduits = pgTable("colonnes_seches_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeColonneSecheEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const colonnesSechesOffres = pgTable("colonnes_seches_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => colonnesSechesProduits.id),
  prixUnitaire: integer("prix_unitaire").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const cafeMachinesProduits = pgTable("cafe_machines_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeMachineEnum().notNull(),
  nbPersonnes: integer("nb_personnes").notNull(),
  nbMachines: integer("nb_machines"),
  typeLait: typeLaitEnum("type_lait"),
  typeChocolat: typeChocolatEnum("type_chocolat"),
  paMaintenance: integer("pa_maintenance"),
  nbPassages: integer("nb_passages"),
  fraisInstallation: integer("frais_installation"),
  cafeMachineId: integer("cafe_machine_id").references(() => cafeMachines.id),
  reconditionne: boolean().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const cafeMachinesOffres = pgTable("cafe_machines_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => cafeMachinesProduits.id),
  typeLocation: typeLocationEnum("type_location").notNull(),
  prixUnitaire: integer("prix_unitaire"),
  rac: integer("rac"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const cafeConsoProduits = pgTable("cafe_conso_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const cafeConsoOffres = pgTable("cafe_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => cafeConsoProduits.id),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const theConsoProduits = pgTable("the_conso_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const theConsoOffres = pgTable("the_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => theConsoProduits.id),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const laitConsoProduits = pgTable("lait_conso_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const laitConsoOffres = pgTable("lait_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => laitConsoProduits.id),
  type: typeLaitEnum().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const chocolatConsoProduits = pgTable("chocolat_conso_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const chocolatConsoOffres = pgTable("chocolat_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => chocolatConsoProduits.id),
  type: typeChocolatEnum().notNull(),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const sucreConsoProduits = pgTable("sucre_conso_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const sucreConsoOffres = pgTable("sucre_conso_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => sucreConsoProduits.id),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const fruitsProduits = pgTable("fruits_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const fruitsOffres = pgTable("fruits_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => fruitsProduits.id),
  prixKg: integer("prix_kg"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const snacksProduits = pgTable("snacks_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const snacksOffres = pgTable("snacks_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => snacksProduits.id),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const boissonsProduits = pgTable("boissons_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  effectif: integer().notNull(),
  gamme: gammeEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const boissonsOffres = pgTable("boissons_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => boissonsProduits.id),
  prixUnitaire: integer("prix_unitaire"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const fontainesProduits = pgTable("fontaines_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  type: typeEau().notNull(),
  typePose: typePose("type_pose").notNull(),
  nbPersonnes: integer("nb_personnes").notNull(),
  paMaintenance: integer("pa_maintenance"),
  fraisInstallation: integer("frais_installation"),
  paConsoFiltres: integer("pa_conso_filtres"),
  paConsoCO2: integer("pa_conso_co2"),
  paConsoEauChaude: integer("pa_conso_eau_chaude"),
  fontaineId: integer("fontaine_id").references(() => fontaines.id),
  reconditionne: boolean().default(false),
  infos: varchar(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const fontainesOffres = pgTable("fontaines_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => fontainesProduits.id),
  typeLocation: typeLocationEnum("type_location").notNull(),
  prixUnitaire: integer("prix_unitaire"),
  rac: integer("rac"),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const officeManagerProduits = pgTable("office_manager_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
});

export const officeManagerOffres = pgTable("office_manager_offres", {
  id: serial().primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => officeManagerProduits.id),
  type: typeOfficeManagerEnum().notNull(),
  demiTjm: integer("demi_tjm").notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

export const servicesFm4allProduits = pgTable("services_fm4all_produits", {
  id: serial().primaryKey(),
  fournisseurId: integer("fournisseur_id")
    .notNull()
    .references(() => fournisseurs.id),
  gamme: gammeEnum().notNull(),
  assurance: inclusEnum().notNull(),
  minFacturationPlateforme: integer("min_facturation_plateforme").notNull(),
  plateforme: inclusEnum().notNull(),
  supportAdmin: inclusEnum("support_admin").notNull(),
  minFacturationSupportOp: integer("min_facturation_support_op"),
  supportOp: inclusEnum("support_op").notNull(),
  minFacturationAccountManager: integer("min_facturation_account_manager"),
  accountManager: inclusEnum("account_manager").notNull(),
  audit: inclusEnum().notNull(),
  remiseCaSeuil: integer("remise_ca_seuil").notNull(),
  remiseCa: integer().notNull(),
  remiseHof: integer("remise_hof").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt,
});

// export const servicesFm4allOffres = pgTable("services_fm4all_offres", {
//   id: serial().primaryKey(),
//   produitId: integer("produit_id")
//     .notNull()
//     .references(() => servicesFm4allProduits.id),
//   tauxAssurance: integer("taux_assurance").notNull(),
//   tauxPlateforme: integer("taux_plateforme").notNull(),
//   tauxSupportAdmin: integer("taux_support_admin").notNull(),
//   tauxSupportOp: integer("taux_support_op"),
//   tauxAccountManager: integer("taux_account_manager"),
//   infos: varchar(),
//   imageUrl: varchar("image_url"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt,
// });

//RELATIONS
export const nettoyageProduitsRelations = relations(
  nettoyageProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(nettoyageOffres),
  }),
);

export const nettoyageOffresRelations = relations(
  nettoyageOffres,
  ({ one }) => ({
    produit: one(nettoyageProduits, {
      fields: [nettoyageOffres.produitId],
      references: [nettoyageProduits.id],
    }),
  }),
);

export const nettoyageRepasseProduitsRelations = relations(
  nettoyageRepasseProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageRepasseProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(nettoyageRepasseOffres),
  }),
);

export const nettoyageRepasseOffresRelations = relations(
  nettoyageRepasseOffres,
  ({ one }) => ({
    produit: one(nettoyageRepasseProduits, {
      fields: [nettoyageRepasseOffres.produitId],
      references: [nettoyageRepasseProduits.id],
    }),
  }),
);

export const nettoyageVitrerieProduitsRelations = relations(
  nettoyageVitrerieProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [nettoyageVitrerieProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(nettoyageVitrerieOffres),
  }),
);

export const nettoyageVitrerieOffresRelations = relations(
  nettoyageVitrerieOffres,
  ({ one }) => ({
    produit: one(nettoyageVitrerieProduits, {
      fields: [nettoyageVitrerieOffres.produitId],
      references: [nettoyageVitrerieProduits.id],
    }),
  }),
);

export const hygieneDistribProduitsRelations = relations(
  hygieneDistribProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneDistribProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(hygieneDistribOffres),
  }),
);

export const hygieneDistribOffresRelations = relations(
  hygieneDistribOffres,
  ({ one }) => ({
    produit: one(hygieneDistribProduits, {
      fields: [hygieneDistribOffres.produitId],
      references: [hygieneDistribProduits.id],
    }),
  }),
);

export const hygieneInstalDistribProduitsRelations = relations(
  hygieneInstalDistribProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneInstalDistribProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(hygieneInstalDistribOffres),
  }),
);

export const hygieneInstalDistribOffresRelations = relations(
  hygieneInstalDistribOffres,
  ({ one }) => ({
    produit: one(hygieneInstalDistribProduits, {
      fields: [hygieneInstalDistribOffres.produitId],
      references: [hygieneInstalDistribProduits.id],
    }),
  }),
);

export const hygieneConsoProduitsRelations = relations(
  hygieneConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [hygieneConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(hygieneConsoOffres),
  }),
);

export const hygieneConsoOffresRelations = relations(
  hygieneConsoOffres,
  ({ one }) => ({
    produit: one(hygieneConsoProduits, {
      fields: [hygieneConsoOffres.produitId],
      references: [hygieneConsoProduits.id],
    }),
  }),
);

export const maintenanceProduitsRelations = relations(
  maintenanceProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [maintenanceProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(maintenanceOffres),
  }),
);
export const maintenanceOffresRelations = relations(
  maintenanceOffres,
  ({ one }) => ({
    produit: one(maintenanceProduits, {
      fields: [maintenanceOffres.produitId],
      references: [maintenanceProduits.id],
    }),
  }),
);

export const legioProduitsRelations = relations(
  legioProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [legioProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(legioOffres),
  }),
);

export const legioOffresRelations = relations(legioOffres, ({ one }) => ({
  produit: one(legioProduits, {
    fields: [legioOffres.produitId],
    references: [legioProduits.id],
  }),
}));

export const q18ProduitsRelations = relations(q18Produits, ({ one, many }) => ({
  fournisseur: one(fournisseurs, {
    fields: [q18Produits.fournisseurId],
    references: [fournisseurs.id],
  }),
  offres: many(q18Offres),
}));

export const q18OffresRelations = relations(q18Offres, ({ one }) => ({
  produit: one(q18Produits, {
    fields: [q18Offres.produitId],
    references: [q18Produits.id],
  }),
}));

export const qualiteAirProduitsRelations = relations(
  qualiteAirProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [qualiteAirProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(qualiteAirOffres),
  }),
);

export const qualiteAirOffresRelations = relations(
  qualiteAirOffres,
  ({ one }) => ({
    produit: one(qualiteAirProduits, {
      fields: [qualiteAirOffres.produitId],
      references: [qualiteAirProduits.id],
    }),
  }),
);

export const incendieProduitsRelations = relations(
  incendieProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [incendieProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(incendieOffres),
  }),
);

export const incendieOffresRelations = relations(incendieOffres, ({ one }) => ({
  produit: one(incendieProduits, {
    fields: [incendieOffres.produitId],
    references: [incendieProduits.id],
  }),
}));
export const exutoiresProduitsRelations = relations(
  exutoiresProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [exutoiresProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(exutoiresOffres),
  }),
);

export const exutoiresOffresRelations = relations(
  exutoiresOffres,
  ({ one }) => ({
    produit: one(exutoiresProduits, {
      fields: [exutoiresOffres.produitId],
      references: [exutoiresProduits.id],
    }),
  }),
);

export const exutoiresParkingProduitsRelations = relations(
  exutoiresParkingProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [exutoiresParkingProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(exutoiresParkingOffres),
  }),
);

export const exutoiresParkingOffresRelations = relations(
  exutoiresParkingOffres,
  ({ one }) => ({
    produit: one(exutoiresParkingProduits, {
      fields: [exutoiresParkingOffres.produitId],
      references: [exutoiresParkingProduits.id],
    }),
  }),
);

export const alarmesProduitsRelations = relations(
  alarmesProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [alarmesProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(alarmesOffres),
  }),
);

export const alarmesOffresRelations = relations(alarmesOffres, ({ one }) => ({
  produit: one(alarmesProduits, {
    fields: [alarmesOffres.produitId],
    references: [alarmesProduits.id],
  }),
}));

export const portesCoupeFeuProduitsRelations = relations(
  portesCoupeFeuProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [portesCoupeFeuProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(portesCoupeFeuOffres),
  }),
);

export const portesCoupeFeuOffresRelations = relations(
  portesCoupeFeuOffres,
  ({ one }) => ({
    produit: one(portesCoupeFeuProduits, {
      fields: [portesCoupeFeuOffres.produitId],
      references: [portesCoupeFeuProduits.id],
    }),
  }),
);

export const riaProduitsRelations = relations(riaProduits, ({ one, many }) => ({
  fournisseur: one(fournisseurs, {
    fields: [riaProduits.fournisseurId],
    references: [fournisseurs.id],
  }),
  offres: many(riaOffres),
}));

export const riaOffresRelations = relations(riaOffres, ({ one }) => ({
  produit: one(riaProduits, {
    fields: [riaOffres.produitId],
    references: [riaProduits.id],
  }),
}));

export const colonnesSechesProduitsRelations = relations(
  colonnesSechesProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [colonnesSechesProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(colonnesSechesOffres),
  }),
);

export const colonnesSechesOffresRelations = relations(
  colonnesSechesOffres,
  ({ one }) => ({
    produit: one(colonnesSechesProduits, {
      fields: [colonnesSechesOffres.produitId],
      references: [colonnesSechesProduits.id],
    }),
  }),
);

export const cafeMachinesProduitsRelations = relations(
  cafeMachinesProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [cafeMachinesProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    cafeMachine: one(cafeMachines, {
      fields: [cafeMachinesProduits.cafeMachineId],
      references: [cafeMachines.id],
    }),
    offres: many(cafeMachinesOffres),
  }),
);

export const cafeMachinesOffresRelations = relations(
  cafeMachinesOffres,
  ({ one }) => ({
    produit: one(cafeMachinesProduits, {
      fields: [cafeMachinesOffres.produitId],
      references: [cafeMachinesProduits.id],
    }),
  }),
);

export const cafeConsoProduitsRelations = relations(
  cafeConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [cafeConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(cafeConsoOffres),
  }),
);

export const cafeConsoOffresRelations = relations(
  cafeConsoOffres,
  ({ one }) => ({
    produit: one(cafeConsoProduits, {
      fields: [cafeConsoOffres.produitId],
      references: [cafeConsoProduits.id],
    }),
  }),
);

export const theConsoProduitsRelations = relations(
  theConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [theConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(theConsoOffres),
  }),
);

export const theConsoOffresRelations = relations(theConsoOffres, ({ one }) => ({
  produit: one(theConsoProduits, {
    fields: [theConsoOffres.produitId],
    references: [theConsoProduits.id],
  }),
}));

export const laitConsoProduitsRelations = relations(
  laitConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [laitConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(laitConsoOffres),
  }),
);

export const laitConsoOffresRelations = relations(
  laitConsoOffres,
  ({ one }) => ({
    produit: one(laitConsoProduits, {
      fields: [laitConsoOffres.produitId],
      references: [laitConsoProduits.id],
    }),
  }),
);

export const chocolatConsoProduitsRelations = relations(
  chocolatConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [chocolatConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(chocolatConsoOffres),
  }),
);

export const chocolatConsoOffresRelations = relations(
  chocolatConsoOffres,
  ({ one }) => ({
    produit: one(chocolatConsoProduits, {
      fields: [chocolatConsoOffres.produitId],
      references: [chocolatConsoProduits.id],
    }),
  }),
);

export const sucreConsoProduitsRelations = relations(
  sucreConsoProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [sucreConsoProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(sucreConsoOffres),
  }),
);

export const sucreConsoOffresRelations = relations(
  sucreConsoOffres,
  ({ one }) => ({
    produit: one(sucreConsoProduits, {
      fields: [sucreConsoOffres.produitId],
      references: [sucreConsoProduits.id],
    }),
  }),
);

export const fruitsProduitsRelations = relations(
  fruitsProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [fruitsProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(fruitsOffres),
  }),
);

export const fruitsOffresRelations = relations(fruitsOffres, ({ one }) => ({
  produit: one(fruitsProduits, {
    fields: [fruitsOffres.produitId],
    references: [fruitsProduits.id],
  }),
}));

export const snacksProduitsRelations = relations(
  snacksProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [snacksProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(snacksOffres),
  }),
);

export const snacksOffresRelations = relations(snacksOffres, ({ one }) => ({
  produit: one(snacksProduits, {
    fields: [snacksOffres.produitId],
    references: [snacksProduits.id],
  }),
}));

export const boissonsProduitsRelations = relations(
  boissonsProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [boissonsProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(boissonsOffres),
  }),
);

export const boissonsOffresRelations = relations(boissonsOffres, ({ one }) => ({
  produit: one(boissonsProduits, {
    fields: [boissonsOffres.produitId],
    references: [boissonsProduits.id],
  }),
}));

export const fontainesProduitsRelations = relations(
  fontainesProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [fontainesProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    fontaine: one(fontaines, {
      fields: [fontainesProduits.fontaineId],
      references: [fontaines.id],
    }),
    offres: many(fontainesOffres),
  }),
);

export const fontainesOffresRelations = relations(
  fontainesOffres,
  ({ one }) => ({
    produit: one(fontainesProduits, {
      fields: [fontainesOffres.produitId],
      references: [fontainesProduits.id],
    }),
  }),
);

export const officeManagerProduitsRelations = relations(
  officeManagerProduits,
  ({ one, many }) => ({
    fournisseur: one(fournisseurs, {
      fields: [officeManagerProduits.fournisseurId],
      references: [fournisseurs.id],
    }),
    offres: many(officeManagerOffres),
  }),
);

export const officeManagerOffresRelations = relations(
  officeManagerOffres,
  ({ one }) => ({
    produit: one(officeManagerProduits, {
      fields: [officeManagerOffres.produitId],
      references: [officeManagerProduits.id],
    }),
  }),
);

// export const servicesFm4allProduitsRelations = relations(
//   servicesFm4allProduits,
//   ({ one, many }) => ({
//     fournisseur: one(fournisseurs, {
//       fields: [servicesFm4allProduits.fournisseurId],
//       references: [fournisseurs.id],
//     }),
//     offres: many(servicesFm4allOffres),
//   }),
// );

// export const servicesFm4allOffresRelations = relations(
//   servicesFm4allOffres,
//   ({ one }) => ({
//     produit: one(servicesFm4allProduits, {
//       fields: [servicesFm4allOffres.produitId],
//       references: [servicesFm4allProduits.id],
//     }),
//   }),
// );
