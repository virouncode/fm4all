import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
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
export const roleEnum = pgEnum("role", ["admin", "fournisseur", "client"]);

export const fournisseurs = pgTable(
  "fournisseurs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fournisseurs_status_idx").on(table.status),
    index("fournisseurs_siret_idx").on(table.siret),
    index("fournisseurs_created_at_idx").on(table.createdAt),
  ],
);

export const clients = pgTable(
  "clients",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("clients_email_contact_idx").on(table.emailContact),
    index("clients_siret_idx").on(table.siret),
    index("clients_code_postal_idx").on(table.codePostal),
    index("clients_ville_idx").on(table.ville),
    index("clients_created_at_idx").on(table.createdAt),
  ],
);

export const logosFournisseurs = pgTable("logos_fournisseurs", {
  id: serial().primaryKey(),
  url: varchar().notNull(),
  type: varchar().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

//SERVICES
export const services = pgTable("services", {
  id: serial().primaryKey(),
  nom: varchar("nom").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const servicesFournisseurs = pgTable(
  "services_fournisseurs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("services_fournisseurs_uniq").on(
      table.fournisseurId,
      table.serviceId,
    ),
    index("services_fournisseurs_fournisseur_idx").on(table.fournisseurId),
    index("services_fournisseurs_service_idx").on(table.serviceId),
  ],
);

//NETTOYAGE
export const nettoyageQuantites = pgTable(
  "nettoyage_quantites",
  {
    id: serial().primaryKey(),
    freqAnnuelle: integer("freq_annuelle").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_quantites_gamme_surface_idx").on(
      table.gamme,
      table.surface,
    ),
    index("nettoyage_quantites_freq_idx").on(table.freqAnnuelle),
  ],
);

export const nettoyageTarifs = pgTable(
  "nettoyage_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("nettoyage_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageRepasseTarifs = pgTable(
  "nettoyage_repasse_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_repasse_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("nettoyage_repasse_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageVitrerieTarifs = pgTable(
  "nettoyage_vitrerie_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_vitrerie_tarifs_fournisseur_idx").on(table.fournisseurId),
  ],
);

//HYGIENE
export const hygieneDistribQuantites = pgTable(
  "hygiene_distrib_quantites",
  {
    id: serial().primaryKey(),
    effectif: integer().notNull(),
    nbDistribEmp: integer("nb_distrib_emp").notNull(),
    nbDistribSavon: integer("nb_distrib_savon").notNull(),
    nbDistribPh: integer("nb_distrib_ph").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_distrib_quantites_effectif_idx").on(table.effectif),
  ],
);

export const hygieneDistribTarifs = pgTable(
  "hygiene_distrib_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_distrib_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("hygiene_distrib_tarifs_fournisseur_type_gamme_idx").on(
      table.fournisseurId,
      table.type,
      table.gamme,
    ),
  ],
);

export const hygieneMinFacturation = pgTable(
  "hygiene_min_facturation",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    minFacturation: integer("min_facturation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_min_facturation_fournisseur_idx").on(table.fournisseurId),
  ],
);

export const hygieneInstalDistribTarifs = pgTable(
  "hygiene_instal_distrib_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixInstallation: integer("prix_installation").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_instal_distrib_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const hygieneConsoTarifs = pgTable(
  "hygiene_conso_tarifs",
  {
    id: serial().primaryKey(),
    effectif: integer(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    paParPersonneEmp: integer("pa_par_personne_emp").notNull(),
    paParPersonneSavon: integer("pa_par_personne_savon").notNull(),
    paParPersonnePh: integer("pa_par_personne_ph").notNull(),
    paParPersonneDesinfectant: integer(
      "pa_par_personne_desinfectant",
    ).notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);
//MAINTENANCE
export const maintenanceQuantites = pgTable(
  "maintenance_quantites",
  {
    id: serial().primaryKey(),
    surface: integer().notNull(),
    freqAnnuelle: integer("freq_annuelle").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("maintenance_quantites_surface_gamme_idx").on(
      table.surface,
      table.gamme,
    ),
    index("maintenance_quantites_freq_idx").on(table.freqAnnuelle),
  ],
);

export const maintenanceTarifs = pgTable(
  "maintenance_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("maintenance_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const legioTarifs = pgTable(
  "legio_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("legio_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const q18Tarifs = pgTable(
  "q18_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("q18_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const qualiteAirTarifs = pgTable(
  "qualite_air_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("qualite_air_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

//INCENDIE
export const incendieQuantites = pgTable(
  "incendie_quantites",
  {
    id: serial().primaryKey(),
    surface: integer().notNull(),
    nbExtincteurs: integer("nb_extincteurs").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("incendie_quantites_surface_idx").on(table.surface)],
);

export const incendieTarifs = pgTable(
  "incendie_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("incendie_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const exutoiresTarifs = pgTable(
  "exutoires_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_tarifs_fournisseur_nb_exutoires_idx").on(
      table.fournisseurId,
      table.nbExutoires,
    ),
  ],
);

export const exutoiresParkingTarifs = pgTable(
  "exutoires_parking_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_parking_tarifs_fournisseur_nb_exutoires_idx").on(
      table.fournisseurId,
      table.nbExutoires,
    ),
  ],
);

export const alarmesTarifs = pgTable(
  "alarmes_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    nbPoints: integer("nb_points").notNull(),
    prixParControle: integer("prix_par_controle").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("alarmes_tarifs_fournisseur_nb_points_idx").on(
      table.fournisseurId,
      table.nbPoints,
    ),
  ],
);

export const portesCoupeFeuTarifs = pgTable(
  "portes_coupe_feu_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    type: typePorteEnum().notNull(),
    prixParPorte: integer("prix_par_porte").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("portes_coupe_feu_tarifs_fournisseur_type_idx").on(
      table.fournisseurId,
      table.type,
    ),
  ],
);

export const riaTarifs = pgTable(
  "ria_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    prixParRIA: integer("prix_par_ria").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ria_tarifs_fournisseur_idx").on(table.fournisseurId)],
);

export const colonnesSechesTarifs = pgTable(
  "colonnes_seches_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    type: typeColonneEnum().notNull(),
    prixParColonne: integer("prix_par_colonne").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("colonnes_seches_tarifs_fournisseur_type_idx").on(
      table.fournisseurId,
      table.type,
    ),
  ],
);

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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cafeMachinesTarifs = pgTable(
  "cafe_machines_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_machines_tarifs_fournisseur_type_nb_personnes_idx").on(
      table.fournisseurId,
      table.type,
      table.nbPersonnes,
    ),
    index("cafe_machines_tarifs_cafe_machine_id_idx").on(table.cafeMachineId),
  ],
);

export const cafeConsoTarifs = pgTable(
  "cafe_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_conso_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const theConsoTarifs = pgTable(
  "the_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("the_conso_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const laitConsoTarifs = pgTable(
  "lait_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixUnitaireDosette: integer("prix_unitaire_dosette"),
    prixUnitaireFrais: integer("prix_unitaire_frais"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("lait_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const chocolatConsoTarifs = pgTable(
  "chocolat_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixUnitaireSachet: integer("prix_unitaire_sachet"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("chocolat_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const sucreConsoTarifs = pgTable(
  "sucre_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("sucre_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

//SNACKS FRUITS BOISSONS
export const fruitsQuantites = pgTable(
  "fruits_quantites",
  {
    id: serial().primaryKey(),
    gParSemaineParPersonne: integer("g_par_semaine_par_personne").notNull(),
    minKgParSemaine: integer("min_kg_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("fruits_quantites_gamme_idx").on(table.gamme)],
);

export const fruitsTarifs = pgTable(
  "fruits_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixKg: integer("prix_kg"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fruits_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const snacksQuantites = pgTable(
  "snacks_quantites",
  {
    id: serial().primaryKey(),
    portionsParSemaineParPersonne: integer(
      "portions_par_semaine_par_personne",
    ).notNull(),
    minPortionsParSemaine: integer("min_portions_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("snacks_quantites_gamme_idx").on(table.gamme)],
);

export const snacksTarifs = pgTable(
  "snacks_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("snacks_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const boissonsQuantites = pgTable(
  "boissons_quantites",
  {
    id: serial().primaryKey(),
    consosParSemaineParPersonne: integer(
      "consos_par_semaine_par_personne",
    ).notNull(),
    gamme: gammeEnum().notNull(),
    minConsosParSemaine: integer("min_consos_par_semaine").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("boissons_quantites_gamme_idx").on(table.gamme)],
);

export const boissonsTarifs = pgTable(
  "boissons_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("boissons_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const foodLivraisonTarifs = pgTable(
  "food_livraison_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("food_livraison_tarifs_fournisseur_freq_idx").on(
      table.fournisseurId,
      table.freqAnnuelle,
    ),
  ],
);

//FONTAINES
export const fontaines = pgTable("fontaines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
export const fontainesTarifs = pgTable(
  "fontaines_tarifs",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fontaines_tarifs_fournisseur_type_nb_personnes_idx").on(
      table.fournisseurId,
      table.type,
      table.nbPersonnes,
    ),
    index("fontaines_tarifs_fontaine_id_idx").on(table.fontaineId),
  ],
);

export const officeManagerQuantites = pgTable(
  "office_manager_quantites",
  {
    id: serial().primaryKey(),
    effectif: integer().notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    demiJParSemaine: integer("demi_j_par_semaine").notNull(),
    majoration: integer().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("office_manager_quantites_effectif_surface_idx").on(
      table.effectif,
      table.surface,
    ),
    index("office_manager_quantites_gamme_idx").on(table.gamme),
  ],
);

export const officeManagerTarifs = pgTable(
  "office_manager_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id),
    demiTjm: integer("demi_tjm").notNull(),
    demiTjmPremium: integer("demi_tjm_premium").notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("office_manager_tarifs_fournisseur_idx").on(table.fournisseurId),
  ],
);

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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const servicesFm4AllOffres = pgTable(
  "services_fm4all_offres",
  {
    id: serial().primaryKey(),
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
export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_client_id_idx").on(table.clientId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);

export const devis = pgTable(
  "devis",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    devisUrl: varchar("devis_url").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_client_id_idx").on(table.clientId),
    index("devis_created_at_idx").on(table.createdAt),
  ],
);

//AUTH
import { text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./schema-helper";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    role: roleEnum("role").default("admin").notNull(),
    fournisseurId: integer("fournisseur_id").references(() => fournisseurs.id),
    clientId: integer("client_id").references(() => clients.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // email est déjà unique() → index implicite
    index("user_role_idx").on(table.role),
    index("user_fournisseur_id_idx").on(table.fournisseurId),
    index("user_client_id_idx").on(table.clientId),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // token est unique() → index implicite
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "account",
  {
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ],
);

//================================== RELATIONS ==================================//
export const clientsRelations = relations(clients, ({ many }) => ({
  devisTemporaires: many(devisTemporaires),
  devis: many(devis),
  users: many(user),
}));
export const fournisseursRelations = relations(
  fournisseurs,
  ({ one, many }) => ({
    officeManagerTarif: one(officeManagerTarifs),
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
    servicesFournisseurs: many(servicesFournisseurs),
    users: many(user),
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

export const servicesFournisseursRelations = relations(
  servicesFournisseurs,
  ({ one }) => ({
    fournisseur: one(fournisseurs, {
      fields: [servicesFournisseurs.fournisseurId],
      references: [fournisseurs.id],
    }),
    service: one(services, {
      fields: [servicesFournisseurs.serviceId],
      references: [services.id],
    }),
  }),
);

export const servicesRelations = relations(services, ({ many }) => ({
  servicesFournisseurs: many(servicesFournisseurs),
}));

export const userRelations = relations(user, ({ one }) => ({
  fournisseur: one(fournisseurs, {
    fields: [user.fournisseurId],
    references: [fournisseurs.id],
  }),
  client: one(clients, {
    fields: [user.clientId],
    references: [clients.id],
  }),
}));
