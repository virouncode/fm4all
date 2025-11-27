import { relations } from "drizzle-orm";
export * from "./auth";
export * from "./cafe";
export * from "./clientFournisseurs";
export * from "./clients";
export * from "./devis";
export * from "./enums";
export * from "./fontaines";
export * from "./food";
export * from "./fournisseurs";
export * from "./hygiene";
export * from "./incendie";
export * from "./maintenance";
export * from "./nettoyage";
export * from "./office-manager";
export * from "./services";
export * from "./services-fm4all";
export * from "./sites";
export * from "./tickets";

// Import tables for relations
import { user } from "./auth";
import {
  cafeConsoTarifs,
  cafeMachines,
  cafeMachinesTarifs,
  chocolatConsoTarifs,
  laitConsoTarifs,
  sucreConsoTarifs,
  theConsoTarifs,
} from "./cafe";
import { clientFournisseurs } from "./clientFournisseurs";
import { clients } from "./clients";
import { devis, devisTemporaires } from "./devis";
import { fontaines, fontainesTarifs } from "./fontaines";
import {
  boissonsTarifs,
  foodLivraisonTarifs,
  fruitsTarifs,
  snacksTarifs,
} from "./food";
import { fournisseurs } from "./fournisseurs";
import {
  hygieneConsoTarifs,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
} from "./hygiene";
import {
  alarmesTarifs,
  colonnesSechesTarifs,
  exutoiresParkingTarifs,
  exutoiresTarifs,
  incendieTarifs,
  portesCoupeFeuTarifs,
  riaTarifs,
} from "./incendie";
import {
  legioTarifs,
  maintenanceTarifs,
  q18Tarifs,
  qualiteAirTarifs,
} from "./maintenance";
import {
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieTarifs,
} from "./nettoyage";
import { officeManagerTarifs } from "./office-manager";
import { services, servicesFournisseurs } from "./services";
import { sites } from "./sites";
import { tickets } from "./tickets";

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  devisTemporaires: many(devisTemporaires),
  devis: many(devis),
  users: many(user),
  clientFournisseurs: many(clientFournisseurs),
  sites: many(sites),
  tickets: many(tickets),
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
    clientFournisseurs: many(clientFournisseurs),
    tickets: many(tickets),
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

export const clientFournisseursRelations = relations(
  clientFournisseurs,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientFournisseurs.clientId],
      references: [clients.id],
    }),
    fournisseur: one(fournisseurs, {
      fields: [clientFournisseurs.fournisseurId],
      references: [fournisseurs.id],
    }),
  }),
);

export const sitesRelations = relations(sites, ({ one, many }) => ({
  client: one(clients, {
    fields: [sites.clientId],
    references: [clients.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  client: one(clients, {
    fields: [tickets.clientId],
    references: [clients.id],
  }),
  site: one(sites, {
    fields: [tickets.siteId],
    references: [sites.id],
  }),
  fournisseur: one(fournisseurs, {
    fields: [tickets.fournisseurId],
    references: [fournisseurs.id],
  }),
  createdBy: one(user, {
    fields: [tickets.createdById],
    references: [user.id],
  }),
}));
