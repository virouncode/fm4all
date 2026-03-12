import { relations } from "drizzle-orm";

// AUTH TABLES
import { account, session, user } from "./auth";
// CAFE TABLES
import {
  cafeConsoTarifs,
  cafeMachines,
  cafeMachinesTarifs,
  chocolatConsoTarifs,
  laitConsoTarifs,
  sucreConsoTarifs,
  theConsoTarifs,
} from "./cafe";
// CONTRATS TABLES
import { contratClientServices, contratDevis, contrats } from "./contrats";
// DEVIS TABLES
import { devis, devisDemandes, devisLignes, devisTemporaires } from "./devis";
// DOCUMENTS TABLES
import { documentTagLinks, documents, documentsLinks, documentsTags } from "./documents";
// ENTREPRISES TABLES
import {
  clientPrestataireRelations as clientPrestataireRelationsTable,
  entrepriseInvitations,
  entrepriseRoles,
  entreprises,
  serviceEntreprises,
} from "./entreprises";
// FACTURES TABLES
import {
  factureLigneAllocations,
  factureLignes,
  factureLignesPrixAppliques,
  factures,
} from "./factures";
// FONTAINES TABLES
import { fontaines, fontainesTarifs } from "./fontaines";
// FOOD TABLES
import {
  boissonsTarifs,
  foodLivraisonTarifs,
  fruitsTarifs,
  snacksTarifs,
} from "./food";
// HYGIENE TABLES
import {
  hygieneConsoTarifs,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
} from "./hygiene";
// INCENDIE TABLES
import {
  alarmesTarifs,
  colonnesSechesTarifs,
  exutoiresParkingTarifs,
  exutoiresTarifs,
  incendieTarifs,
  portesCoupeFeuTarifs,
  riaTarifs,
} from "./incendie";
// MAINTENANCE TABLES
import {
  legioTarifs,
  maintenanceTarifs,
  q18Tarifs,
  qualiteAirTarifs,
} from "./maintenance";
// NETTOYAGE TABLES
import {
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieTarifs,
} from "./nettoyage";
// OFFICE MANAGER TABLES
import { officeManagerTarifs } from "./office-manager";
// PAIEMENTS TABLES
import { paiements, paiementsAllocations } from "./paiements";
// PROSPECTS TABLES
import { prospects } from "./prospects";
// SERVICES TABLES
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePerimetre,
  clientServicePrixAppliques,
  clientServices,
  occurrenceTaches,
  services,
  tacheListeItems,
  tacheListesTemplates,
} from "./services";
// Note: servicesFm4AllTaux and servicesFm4AllOffres are standalone tables without foreign keys
// SITES TABLES
import { sites, sitesArborescence } from "./sites";
// TICKETS TABLES
import { ticketMessages, tickets } from "./tickets";
// USERS TABLES
import {
  userClientAdhesions,
  userClientSiteAttributions,
  userPlateformeAdhesions,
  userPrestataireAdhesions,
  userPrestataireSiteAttributions,
  usersArborescence,
} from "./users";

// ═══════════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// AUTH RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  avatar: one(documents, {
    fields: [user.avatarId],
    references: [documents.id],
  }),
  createdBy: one(user, {
    fields: [user.createdById],
    references: [user.id],
    relationName: "userCreatedBy",
  }),
  updatedBy: one(user, {
    fields: [user.updatedById],
    references: [user.id],
    relationName: "userUpdatedBy",
  }),
  sessions: many(session),
  accounts: many(account),
  clientAdhesions: many(userClientAdhesions),
  clientSiteAttributions: many(userClientSiteAttributions),
  prestataireAdhesions: many(userPrestataireAdhesions),
  prestataireSiteAttributions: many(userPrestataireSiteAttributions),
  ticketsAssigned: many(tickets, { relationName: "ticketAssigneeUser" }),
  ticketMessages: many(ticketMessages),
  occurrencesAssigned: many(clientServiceOccurrences, {
    relationName: "occurrenceAssignee",
  }),
  occurrencesDemandees: many(clientServiceOccurrences, {
    relationName: "occurrenceDemandee",
  }),
  tachesAssigned: many(occurrenceTaches, { relationName: "tacheAssignee" }),
  tachesCompletees: many(occurrenceTaches, { relationName: "tacheCompletee" }),
  plateformeAdhesion: one(userPlateformeAdhesions, {
    fields: [user.id],
    references: [userPlateformeAdhesions.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECTS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const prospectsRelations = relations(prospects, ({ many }) => ({
  entreprises: many(entreprises),
  devisTemporaires: many(devisTemporaires),
}));

// ─────────────────────────────────────────────────────────────────────────────
// ENTREPRISES RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const entreprisesRelations = relations(entreprises, ({ one, many }) => ({
  prospect: one(prospects, {
    fields: [entreprises.prospectId],
    references: [prospects.id],
  }),
  createdBy: one(user, {
    fields: [entreprises.createdById],
    references: [user.id],
    relationName: "entrepriseCreatedBy",
  }),
  updatedBy: one(user, {
    fields: [entreprises.updatedById],
    references: [user.id],
    relationName: "entrepriseUpdatedBy",
  }),
  roles: many(entrepriseRoles),
  serviceEntreprises: many(serviceEntreprises),
  sites: many(sites),
  clientAdhesions: many(userClientAdhesions),
  prestataireAdhesions: many(userPrestataireAdhesions),
  // Contrats relations
  contratsProprietaire: many(contrats, { relationName: "contratProprietaire" }),
  contratsPartieA: many(contrats, { relationName: "contratPartieA" }),
  contratsPartieB: many(contrats, { relationName: "contratPartieB" }),
  // Devis relations
  devisDemandeur: many(devis, { relationName: "devisDemandeur" }),
  devisEmetteur: many(devis, { relationName: "devisEmetteur" }),
  devisProprietaire: many(devis, { relationName: "devisProprietaire" }),
  devisDemandes: many(devisDemandes),
  // Factures relations
  facturesEmetteur: many(factures, { relationName: "factureEmetteur" }),
  facturesDestinataire: many(factures, { relationName: "factureDestinataire" }),
  facturesProprietaire: many(factures, { relationName: "factureProprietaire" }),
  // Paiements relations
  paiementsPayeur: many(paiements, { relationName: "paiementPayeur" }),
  paiementsReceveur: many(paiements, { relationName: "paiementReceveur" }),
  // Tickets relations
  ticketsProprietaire: many(tickets, { relationName: "ticketProprietaire" }),
  ticketsDemandeur: many(tickets, { relationName: "ticketDemandeur" }),
  ticketsAssigne: many(tickets, { relationName: "ticketAssigneEntreprise" }),
  // Documents relations
  logo: one(documents, {
    fields: [entreprises.logoId],
    references: [documents.id],
    relationName: "entrepriseLogo",
  }),
  documentsProprietaire: many(documents, {
    relationName: "documentsProprietaireEntreprise",
  }),
  // Client/prestataire relations
  clientPrestataireAsClient: many(clientPrestataireRelationsTable, {
    relationName: "cpRelationClient",
  }),
  clientPrestataireAsPrestataire: many(clientPrestataireRelationsTable, {
    relationName: "cpRelationPrestataire",
  }),
  invitations: many(entrepriseInvitations),
  // Client services
  clientServices: many(clientServices),
  // Tarifs relations
  cafeMachinesTarifs: many(cafeMachinesTarifs),
  cafeConsoTarifs: many(cafeConsoTarifs),
  theConsoTarifs: many(theConsoTarifs),
  laitConsoTarifs: many(laitConsoTarifs),
  chocolatConsoTarifs: many(chocolatConsoTarifs),
  sucreConsoTarifs: many(sucreConsoTarifs),
  fontainesTarifs: many(fontainesTarifs),
  fruitsTarifs: many(fruitsTarifs),
  snacksTarifs: many(snacksTarifs),
  boissonsTarifs: many(boissonsTarifs),
  foodLivraisonTarifs: many(foodLivraisonTarifs),
  hygieneDistribTarifs: many(hygieneDistribTarifs),
  hygieneMinFacturation: many(hygieneMinFacturation),
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
  nettoyageTarifs: many(nettoyageTarifs),
  nettoyageRepasseTarifs: many(nettoyageRepasseTarifs),
  nettoyageVitrerieTarifs: many(nettoyageVitrerieTarifs),
  officeManagerTarifs: many(officeManagerTarifs),
  tacheListesTemplates: many(tacheListesTemplates),
}));

export const entrepriseRolesRelations = relations(
  entrepriseRoles,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [entrepriseRoles.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const serviceEntreprisesRelations = relations(
  serviceEntreprises,
  ({ one, many }) => ({
    entreprise: one(entreprises, {
      fields: [serviceEntreprises.entrepriseId],
      references: [entreprises.id],
    }),
    service: one(services, {
      fields: [serviceEntreprises.serviceId],
      references: [services.id],
    }),
    clientServiceExecutions: many(clientServiceExecutions),
  }),
);

export const clientPrestataireRelationsRelations = relations(
  clientPrestataireRelationsTable,
  ({ one }) => ({
    clientEntreprise: one(entreprises, {
      fields: [clientPrestataireRelationsTable.clientEntrepriseId],
      references: [entreprises.id],
      relationName: "cpRelationClient",
    }),
    prestataireEntreprise: one(entreprises, {
      fields: [clientPrestataireRelationsTable.prestataireEntrepriseId],
      references: [entreprises.id],
      relationName: "cpRelationPrestataire",
    }),
  }),
);

export const entrepriseInvitationsRelations = relations(
  entrepriseInvitations,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [entrepriseInvitations.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// SITES RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const sitesRelations = relations(sites, ({ one, many }) => ({
  entreprise: one(entreprises, {
    fields: [sites.entrepriseId],
    references: [entreprises.id],
  }),
  parent: one(sites, {
    fields: [sites.parentId],
    references: [sites.id],
    relationName: "siteParent",
  }),
  children: many(sites, { relationName: "siteParent" }),
  contrats: many(contrats),
  devis: many(devis),
  devisDemandes: many(devisDemandes),
  clientServices: many(clientServices),
  clientServiceOccurrences: many(clientServiceOccurrences),
  clientServiceExecutions: many(clientServiceExecutions),
  clientServicePerimetres: many(clientServicePerimetre),
  userClientSiteAttributions: many(userClientSiteAttributions),
  userPrestataireSiteAttributions: many(userPrestataireSiteAttributions),
  factureLigneAllocations: many(factureLigneAllocations),
  documentsLinks: many(documentsLinks),
}));

export const sitesArborescenceRelations = relations(
  sitesArborescence,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [sitesArborescence.entrepriseId],
      references: [entreprises.id],
    }),
    ancetre: one(sites, {
      fields: [sitesArborescence.ancetreId],
      references: [sites.id],
      relationName: "siteAncetre",
    }),
    descendant: one(sites, {
      fields: [sitesArborescence.descendantId],
      references: [sites.id],
      relationName: "siteDescendant",
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const documentsRelations = relations(documents, ({ one, many }) => ({
  proprietaireEntreprise: one(entreprises, {
    fields: [documents.proprietaireEntrepriseId],
    references: [entreprises.id],
    relationName: "documentsProprietaireEntreprise",
  }),
  links: many(documentsLinks),
  tagLinks: many(documentTagLinks),
  // Tables qui référencent documents.imageId
  cafeMachines: many(cafeMachines),
  fontaines: many(fontaines),
  // Tables qui référencent documents.id comme logo/avatar
  entreprisesLogo: many(entreprises, { relationName: "entrepriseLogo" }),
}));

export const documentsLinksRelations = relations(documentsLinks, ({ one }) => ({
  document: one(documents, {
    fields: [documentsLinks.documentId],
    references: [documents.id],
  }),
  proprietaireEntreprise: one(entreprises, {
    fields: [documentsLinks.proprietaireEntrepriseId],
    references: [entreprises.id],
  }),
  entreprise: one(entreprises, {
    fields: [documentsLinks.entrepriseId],
    references: [entreprises.id],
    relationName: "documentsLinksEntreprise",
  }),
  site: one(sites, {
    fields: [documentsLinks.siteId],
    references: [sites.id],
  }),
  ticket: one(tickets, {
    fields: [documentsLinks.ticketId],
    references: [tickets.id],
  }),
  ticketMessage: one(ticketMessages, {
    fields: [documentsLinks.ticketMessageId],
    references: [ticketMessages.id],
  }),
  occurrence: one(clientServiceOccurrences, {
    fields: [documentsLinks.occurrenceId],
    references: [clientServiceOccurrences.id],
  }),
  devis: one(devis, {
    fields: [documentsLinks.devisId],
    references: [devis.id],
  }),
  contrat: one(contrats, {
    fields: [documentsLinks.contratId],
    references: [contrats.id],
  }),
  facture: one(factures, {
    fields: [documentsLinks.factureId],
    references: [factures.id],
  }),
  clientService: one(clientServices, {
    fields: [documentsLinks.clientServiceId],
    references: [clientServices.id],
  }),
  clientServiceExecution: one(clientServiceExecutions, {
    fields: [documentsLinks.clientServiceExecutionId],
    references: [clientServiceExecutions.id],
  }),
  occurrenceTache: one(occurrenceTaches, {
    fields: [documentsLinks.occurrenceTacheId],
    references: [occurrenceTaches.id],
  }),
}));

export const documentsTagsRelations = relations(documentsTags, ({ one, many }) => ({
  proprietaireEntreprise: one(entreprises, {
    fields: [documentsTags.proprietaireEntrepriseId],
    references: [entreprises.id],
  }),
  tagLinks: many(documentTagLinks),
}));

export const documentTagLinksRelations = relations(documentTagLinks, ({ one }) => ({
  document: one(documents, {
    fields: [documentTagLinks.documentId],
    references: [documents.id],
  }),
  tag: one(documentsTags, {
    fields: [documentTagLinks.tagId],
    references: [documentsTags.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const servicesRelations = relations(services, ({ many }) => ({
  serviceEntreprises: many(serviceEntreprises),
  clientServices: many(clientServices),
  devisDemandes: many(devisDemandes),
  devisLignes: many(devisLignes),
  factureLignes: many(factureLignes),
  tacheListesTemplates: many(tacheListesTemplates),
}));

export const clientServicesRelations = relations(
  clientServices,
  ({ one, many }) => ({
    entreprise: one(entreprises, {
      fields: [clientServices.entrepriseId],
      references: [entreprises.id],
    }),
    site: one(sites, {
      fields: [clientServices.siteId],
      references: [sites.id],
    }),
    service: one(services, {
      fields: [clientServices.serviceId],
      references: [services.id],
    }),
    occurrences: many(clientServiceOccurrences),
    executions: many(clientServiceExecutions),
    perimetres: many(clientServicePerimetre),
    contratClientServices: many(contratClientServices),
    factures: many(factures),
    factureLigneAllocations: many(factureLigneAllocations),
    documentsLinks: many(documentsLinks),
    prixAppliques: many(clientServicePrixAppliques),
  }),
);

export const clientServiceOccurrencesRelations = relations(
  clientServiceOccurrences,
  ({ one, many }) => ({
    clientService: one(clientServices, {
      fields: [clientServiceOccurrences.clientServiceId],
      references: [clientServices.id],
    }),
    site: one(sites, {
      fields: [clientServiceOccurrences.siteId],
      references: [sites.id],
    }),
    execution: one(clientServiceExecutions, {
      fields: [clientServiceOccurrences.executionId],
      references: [clientServiceExecutions.id],
    }),
    assigneeUser: one(user, {
      fields: [clientServiceOccurrences.assigneeUserId],
      references: [user.id],
      relationName: "occurrenceAssignee",
    }),
    demandeeParUser: one(user, {
      fields: [clientServiceOccurrences.demandeeParUserId],
      references: [user.id],
      relationName: "occurrenceDemandee",
    }),
    taches: many(occurrenceTaches),
    tickets: many(tickets),
    factureLigneAllocations: many(factureLigneAllocations),
    documentsLinks: many(documentsLinks),
    prixAppliques: many(clientServicePrixAppliques),
  }),
);

export const clientServiceExecutionsRelations = relations(
  clientServiceExecutions,
  ({ one, many }) => ({
    clientService: one(clientServices, {
      fields: [clientServiceExecutions.clientServiceId],
      references: [clientServices.id],
    }),
    site: one(sites, {
      fields: [clientServiceExecutions.siteId],
      references: [sites.id],
    }),
    serviceEntreprise: one(serviceEntreprises, {
      fields: [clientServiceExecutions.serviceEntrepriseId],
      references: [serviceEntreprises.id],
    }),
    prix: many(clientServiceExecutionPrix),
    occurrences: many(clientServiceOccurrences),
    documentsLinks: many(documentsLinks),
    tacheListeTemplate: one(tacheListesTemplates, {
      fields: [clientServiceExecutions.tacheListeTemplateId],
      references: [tacheListesTemplates.id],
    }),
    prixAppliques: many(clientServicePrixAppliques),
  }),
);

export const clientServiceExecutionPrixRelations = relations(
  clientServiceExecutionPrix,
  ({ one, many }) => ({
    execution: one(clientServiceExecutions, {
      fields: [clientServiceExecutionPrix.executionId],
      references: [clientServiceExecutions.id],
    }),
    prixAppliques: many(clientServicePrixAppliques),
  }),
);

export const clientServicePerimetreRelations = relations(
  clientServicePerimetre,
  ({ one }) => ({
    clientService: one(clientServices, {
      fields: [clientServicePerimetre.clientServiceId],
      references: [clientServices.id],
    }),
    site: one(sites, {
      fields: [clientServicePerimetre.siteId],
      references: [sites.id],
    }),
  }),
);

export const clientServicePrixAppliquesRelations = relations(
  clientServicePrixAppliques,
  ({ one, many }) => ({
    executionPrix: one(clientServiceExecutionPrix, {
      fields: [clientServicePrixAppliques.executionPrixId],
      references: [clientServiceExecutionPrix.id],
    }),
    clientService: one(clientServices, {
      fields: [clientServicePrixAppliques.clientServiceId],
      references: [clientServices.id],
    }),
    execution: one(clientServiceExecutions, {
      fields: [clientServicePrixAppliques.executionId],
      references: [clientServiceExecutions.id],
    }),
    occurrence: one(clientServiceOccurrences, {
      fields: [clientServicePrixAppliques.occurrenceId],
      references: [clientServiceOccurrences.id],
    }),
    factureLignesPrixAppliques: many(factureLignesPrixAppliques),
  }),
);

export const tacheListesTemplatesRelations = relations(
  tacheListesTemplates,
  ({ one, many }) => ({
    service: one(services, {
      fields: [tacheListesTemplates.serviceId],
      references: [services.id],
    }),
    proprietaireEntreprise: one(entreprises, {
      fields: [tacheListesTemplates.proprietaireEntrepriseId],
      references: [entreprises.id],
    }),
    items: many(tacheListeItems),
    clientServices: many(clientServices),
    clientServiceExecutions: many(clientServiceExecutions),
  }),
);

export const tacheListeItemsRelations = relations(
  tacheListeItems,
  ({ one, many }) => ({
    listeTemplate: one(tacheListesTemplates, {
      fields: [tacheListeItems.listeTemplateId],
      references: [tacheListesTemplates.id],
    }),
    occurrenceTaches: many(occurrenceTaches),
  }),
);

export const occurrenceTachesRelations = relations(
  occurrenceTaches,
  ({ one, many }) => ({
    occurrence: one(clientServiceOccurrences, {
      fields: [occurrenceTaches.occurrenceId],
      references: [clientServiceOccurrences.id],
    }),
    listeItem: one(tacheListeItems, {
      fields: [occurrenceTaches.listeItemId],
      references: [tacheListeItems.id],
    }),
    assigneeUser: one(user, {
      fields: [occurrenceTaches.assigneeUserId],
      references: [user.id],
      relationName: "tacheAssignee",
    }),
    completeeParUser: one(user, {
      fields: [occurrenceTaches.completeeParUserId],
      references: [user.id],
      relationName: "tacheCompletee",
    }),
    tickets: many(tickets),
    documentsLinks: many(documentsLinks),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  occurrence: one(clientServiceOccurrences, {
    fields: [tickets.occurrenceId],
    references: [clientServiceOccurrences.id],
  }),
  occurrenceTache: one(occurrenceTaches, {
    fields: [tickets.occurrenceTacheId],
    references: [occurrenceTaches.id],
  }),
  proprietaireEntreprise: one(entreprises, {
    fields: [tickets.proprietaireEntrepriseId],
    references: [entreprises.id],
    relationName: "ticketProprietaire",
  }),
  demandeurEntreprise: one(entreprises, {
    fields: [tickets.demandeurEntrepriseId],
    references: [entreprises.id],
    relationName: "ticketDemandeur",
  }),
  assigneEntreprise: one(entreprises, {
    fields: [tickets.assigneEntrepriseId],
    references: [entreprises.id],
    relationName: "ticketAssigneEntreprise",
  }),
  assigneUser: one(user, {
    fields: [tickets.assigneUserId],
    references: [user.id],
    relationName: "ticketAssigneeUser",
  }),
  site: one(sites, {
    fields: [tickets.siteId],
    references: [sites.id],
  }),
  createdByUser: one(user, {
    fields: [tickets.createdById],
    references: [user.id],
    relationName: "ticketCreatedBy",
  }),
  updatedByUser: one(user, {
    fields: [tickets.updatedById],
    references: [user.id],
    relationName: "ticketUpdatedBy",
  }),
  messages: many(ticketMessages),
  devisDemandes: many(devisDemandes),
  devis: many(devis),
  factures: many(factures),
  factureLigneAllocations: many(factureLigneAllocations),
  documentsLinks: many(documentsLinks),
}));

export const ticketMessagesRelations = relations(
  ticketMessages,
  ({ one, many }) => ({
    ticket: one(tickets, {
      fields: [ticketMessages.ticketId],
      references: [tickets.id],
    }),
    auteurUser: one(user, {
      fields: [ticketMessages.auteurUserId],
      references: [user.id],
    }),
    documentsLinks: many(documentsLinks),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// DEVIS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const devisTemporairesRelations = relations(
  devisTemporaires,
  ({ one }) => ({
    prospect: one(prospects, {
      fields: [devisTemporaires.prospectId],
      references: [prospects.id],
    }),
  }),
);

export const devisDemandesRelations = relations(
  devisDemandes,
  ({ one, many }) => ({
    demandeurEntreprise: one(entreprises, {
      fields: [devisDemandes.demandeurEntrepriseId],
      references: [entreprises.id],
    }),
    site: one(sites, {
      fields: [devisDemandes.siteId],
      references: [sites.id],
    }),
    ticket: one(tickets, {
      fields: [devisDemandes.ticketId],
      references: [tickets.id],
    }),
    service: one(services, {
      fields: [devisDemandes.serviceId],
      references: [services.id],
    }),
    devis: many(devis),
  }),
);

export const devisRelations = relations(devis, ({ one, many }) => ({
  devisDemande: one(devisDemandes, {
    fields: [devis.devisDemandeId],
    references: [devisDemandes.id],
  }),
  demandeurEntreprise: one(entreprises, {
    fields: [devis.demandeurEntrepriseId],
    references: [entreprises.id],
    relationName: "devisDemandeur",
  }),
  emetteurEntreprise: one(entreprises, {
    fields: [devis.emetteurEntrepriseId],
    references: [entreprises.id],
    relationName: "devisEmetteur",
  }),
  proprietaireEntreprise: one(entreprises, {
    fields: [devis.proprietaireEntrepriseId],
    references: [entreprises.id],
    relationName: "devisProprietaire",
  }),
  site: one(sites, {
    fields: [devis.siteId],
    references: [sites.id],
  }),
  ticket: one(tickets, {
    fields: [devis.ticketId],
    references: [tickets.id],
  }),
  lignes: many(devisLignes),
  contratDevis: many(contratDevis),
  documentsLinks: many(documentsLinks),
}));

export const devisLignesRelations = relations(devisLignes, ({ one }) => ({
  devis: one(devis, {
    fields: [devisLignes.devisId],
    references: [devis.id],
  }),
  service: one(services, {
    fields: [devisLignes.serviceId],
    references: [services.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// CONTRATS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const contratsRelations = relations(contrats, ({ one, many }) => ({
  proprietaireEntreprise: one(entreprises, {
    fields: [contrats.proprietaireEntrepriseId],
    references: [entreprises.id],
    relationName: "contratProprietaire",
  }),
  partieAEntreprise: one(entreprises, {
    fields: [contrats.partieAEntrepriseId],
    references: [entreprises.id],
    relationName: "contratPartieA",
  }),
  partieBEntreprise: one(entreprises, {
    fields: [contrats.partieBEntrepriseId],
    references: [entreprises.id],
    relationName: "contratPartieB",
  }),
  site: one(sites, {
    fields: [contrats.siteId],
    references: [sites.id],
  }),
  contratDevis: many(contratDevis),
  contratClientServices: many(contratClientServices),
  documentsLinks: many(documentsLinks),
}));

export const contratDevisRelations = relations(contratDevis, ({ one }) => ({
  contrat: one(contrats, {
    fields: [contratDevis.contratId],
    references: [contrats.id],
  }),
  devis: one(devis, {
    fields: [contratDevis.devisId],
    references: [devis.id],
  }),
  proprietaireEntreprise: one(entreprises, {
    fields: [contratDevis.proprietaireEntrepriseId],
    references: [entreprises.id],
  }),
}));

export const contratClientServicesRelations = relations(
  contratClientServices,
  ({ one }) => ({
    contrat: one(contrats, {
      fields: [contratClientServices.contratId],
      references: [contrats.id],
    }),
    clientService: one(clientServices, {
      fields: [contratClientServices.clientServiceId],
      references: [clientServices.id],
    }),
    proprietaireEntreprise: one(entreprises, {
      fields: [contratClientServices.proprietaireEntrepriseId],
      references: [entreprises.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// FACTURES RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const facturesRelations = relations(factures, ({ one, many }) => ({
  emetteurEntreprise: one(entreprises, {
    fields: [factures.emetteurEntrepriseId],
    references: [entreprises.id],
    relationName: "factureEmetteur",
  }),
  destinataireEntreprise: one(entreprises, {
    fields: [factures.destinataireEntrepriseId],
    references: [entreprises.id],
    relationName: "factureDestinataire",
  }),
  proprietaireEntreprise: one(entreprises, {
    fields: [factures.proprietaireEntrepriseId],
    references: [entreprises.id],
    relationName: "factureProprietaire",
  }),
  clientService: one(clientServices, {
    fields: [factures.clientServiceId],
    references: [clientServices.id],
  }),
  ticket: one(tickets, {
    fields: [factures.ticketId],
    references: [tickets.id],
  }),
  lignes: many(factureLignes),
  paiementsAllocations: many(paiementsAllocations),
  documentsLinks: many(documentsLinks),
}));

export const factureLignesRelations = relations(
  factureLignes,
  ({ one, many }) => ({
    facture: one(factures, {
      fields: [factureLignes.factureId],
      references: [factures.id],
    }),
    service: one(services, {
      fields: [factureLignes.serviceId],
      references: [services.id],
    }),
    allocations: many(factureLigneAllocations),
    prixAppliques: many(factureLignesPrixAppliques),
  }),
);

export const factureLignesPrixAppliquesRelations = relations(
  factureLignesPrixAppliques,
  ({ one }) => ({
    factureLigne: one(factureLignes, {
      fields: [factureLignesPrixAppliques.factureLigneId],
      references: [factureLignes.id],
    }),
    clientServicePrixApplique: one(clientServicePrixAppliques, {
      fields: [factureLignesPrixAppliques.clientServicePrixAppliqueId],
      references: [clientServicePrixAppliques.id],
    }),
  }),
);

export const factureLigneAllocationsRelations = relations(
  factureLigneAllocations,
  ({ one }) => ({
    factureLigne: one(factureLignes, {
      fields: [factureLigneAllocations.factureLigneId],
      references: [factureLignes.id],
    }),
    site: one(sites, {
      fields: [factureLigneAllocations.siteId],
      references: [sites.id],
    }),
    clientService: one(clientServices, {
      fields: [factureLigneAllocations.clientServiceId],
      references: [clientServices.id],
    }),
    occurrence: one(clientServiceOccurrences, {
      fields: [factureLigneAllocations.occurrenceId],
      references: [clientServiceOccurrences.id],
    }),
    ticket: one(tickets, {
      fields: [factureLigneAllocations.ticketId],
      references: [tickets.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// PAIEMENTS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const paiementsRelations = relations(paiements, ({ one, many }) => ({
  payeurEntreprise: one(entreprises, {
    fields: [paiements.payeurEntrepriseId],
    references: [entreprises.id],
    relationName: "paiementPayeur",
  }),
  receveurEntreprise: one(entreprises, {
    fields: [paiements.receveurEntrepriseId],
    references: [entreprises.id],
    relationName: "paiementReceveur",
  }),
  allocations: many(paiementsAllocations),
}));

export const paiementsAllocationsRelations = relations(
  paiementsAllocations,
  ({ one }) => ({
    paiement: one(paiements, {
      fields: [paiementsAllocations.paiementId],
      references: [paiements.id],
    }),
    facture: one(factures, {
      fields: [paiementsAllocations.factureId],
      references: [factures.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// USERS RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const usersArborescenceRelations = relations(
  usersArborescence,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [usersArborescence.entrepriseId],
      references: [entreprises.id],
    }),
    ancetre: one(user, {
      fields: [usersArborescence.ancetreId],
      references: [user.id],
      relationName: "userAncetre",
    }),
    descendant: one(user, {
      fields: [usersArborescence.descendantId],
      references: [user.id],
      relationName: "userDescendant",
    }),
    createdBy: one(user, {
      fields: [usersArborescence.createdById],
      references: [user.id],
      relationName: "usersArborescenceCreatedBy",
    }),
    updatedBy: one(user, {
      fields: [usersArborescence.updatedById],
      references: [user.id],
      relationName: "usersArborescenceUpdatedBy",
    }),
  }),
);

export const userClientSiteAttributionsRelations = relations(
  userClientSiteAttributions,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [userClientSiteAttributions.entrepriseId],
      references: [entreprises.id],
    }),
    user: one(user, {
      fields: [userClientSiteAttributions.userId],
      references: [user.id],
    }),
    site: one(sites, {
      fields: [userClientSiteAttributions.siteId],
      references: [sites.id],
    }),
    createdBy: one(user, {
      fields: [userClientSiteAttributions.createdById],
      references: [user.id],
      relationName: "userClientSiteAttributionsCreatedBy",
    }),
    updatedBy: one(user, {
      fields: [userClientSiteAttributions.updatedById],
      references: [user.id],
      relationName: "userClientSiteAttributionsUpdatedBy",
    }),
  }),
);

export const userPrestataireSiteAttributionsRelations = relations(
  userPrestataireSiteAttributions,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [userPrestataireSiteAttributions.entrepriseId],
      references: [entreprises.id],
    }),
    user: one(user, {
      fields: [userPrestataireSiteAttributions.userId],
      references: [user.id],
    }),
    site: one(sites, {
      fields: [userPrestataireSiteAttributions.siteId],
      references: [sites.id],
    }),
    createdBy: one(user, {
      fields: [userPrestataireSiteAttributions.createdById],
      references: [user.id],
      relationName: "userPrestataireSiteAttributionsCreatedBy",
    }),
    updatedBy: one(user, {
      fields: [userPrestataireSiteAttributions.updatedById],
      references: [user.id],
      relationName: "userPrestataireSiteAttributionsUpdatedBy",
    }),
  }),
);

export const userClientAdhesionsRelations = relations(
  userClientAdhesions,
  ({ one }) => ({
    user: one(user, {
      fields: [userClientAdhesions.userId],
      references: [user.id],
    }),
    entreprise: one(entreprises, {
      fields: [userClientAdhesions.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const userPrestataireAdhesionsRelations = relations(
  userPrestataireAdhesions,
  ({ one }) => ({
    user: one(user, {
      fields: [userPrestataireAdhesions.userId],
      references: [user.id],
    }),
    entreprise: one(entreprises, {
      fields: [userPrestataireAdhesions.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const userPlateformeAdhesionsRelations = relations(
  userPlateformeAdhesions,
  ({ one }) => ({
    user: one(user, {
      fields: [userPlateformeAdhesions.userId],
      references: [user.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// CAFE RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const cafeMachinesRelations = relations(cafeMachines, ({ one }) => ({
  image: one(documents, {
    fields: [cafeMachines.imageId],
    references: [documents.id],
  }),
}));

export const cafeMachinesTarifsRelations = relations(
  cafeMachinesTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [cafeMachinesTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [cafeMachinesTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const cafeConsoTarifsRelations = relations(
  cafeConsoTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [cafeConsoTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [cafeConsoTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const theConsoTarifsRelations = relations(theConsoTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [theConsoTarifs.entrepriseId],
    references: [entreprises.id],
  }),
  image: one(documents, {
    fields: [theConsoTarifs.imageId],
    references: [documents.id],
  }),
}));

export const laitConsoTarifsRelations = relations(
  laitConsoTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [laitConsoTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [laitConsoTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const chocolatConsoTarifsRelations = relations(
  chocolatConsoTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [chocolatConsoTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [chocolatConsoTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const sucreConsoTarifsRelations = relations(
  sucreConsoTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [sucreConsoTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [sucreConsoTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// FONTAINES RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const fontainesRelations = relations(fontaines, ({ one }) => ({
  image: one(documents, {
    fields: [fontaines.imageId],
    references: [documents.id],
  }),
}));

export const fontainesTarifsRelations = relations(
  fontainesTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [fontainesTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [fontainesTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// FOOD RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const fruitsTarifsRelations = relations(fruitsTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [fruitsTarifs.entrepriseId],
    references: [entreprises.id],
  }),
  image: one(documents, {
    fields: [fruitsTarifs.imageId],
    references: [documents.id],
  }),
}));

export const snacksTarifsRelations = relations(snacksTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [snacksTarifs.entrepriseId],
    references: [entreprises.id],
  }),
  image: one(documents, {
    fields: [snacksTarifs.imageId],
    references: [documents.id],
  }),
}));

export const boissonsTarifsRelations = relations(boissonsTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [boissonsTarifs.entrepriseId],
    references: [entreprises.id],
  }),
  image: one(documents, {
    fields: [boissonsTarifs.imageId],
    references: [documents.id],
  }),
}));

export const foodLivraisonTarifsRelations = relations(
  foodLivraisonTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [foodLivraisonTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// HYGIENE RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const hygieneDistribTarifsRelations = relations(
  hygieneDistribTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [hygieneDistribTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [hygieneDistribTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const hygieneMinFacturationRelations = relations(
  hygieneMinFacturation,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [hygieneMinFacturation.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const hygieneInstalDistribTarifsRelations = relations(
  hygieneInstalDistribTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [hygieneInstalDistribTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const hygieneConsoTarifsRelations = relations(
  hygieneConsoTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [hygieneConsoTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [hygieneConsoTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// INCENDIE RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const incendieTarifsRelations = relations(incendieTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [incendieTarifs.entrepriseId],
    references: [entreprises.id],
  }),
  image: one(documents, {
    fields: [incendieTarifs.imageId],
    references: [documents.id],
  }),
}));

export const exutoiresTarifsRelations = relations(
  exutoiresTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [exutoiresTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const exutoiresParkingTarifsRelations = relations(
  exutoiresParkingTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [exutoiresParkingTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const alarmesTarifsRelations = relations(alarmesTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [alarmesTarifs.entrepriseId],
    references: [entreprises.id],
  }),
}));

export const portesCoupeFeuTarifsRelations = relations(
  portesCoupeFeuTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [portesCoupeFeuTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

export const riaTarifsRelations = relations(riaTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [riaTarifs.entrepriseId],
    references: [entreprises.id],
  }),
}));

export const colonnesSechesTarifsRelations = relations(
  colonnesSechesTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [colonnesSechesTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const maintenanceTarifsRelations = relations(
  maintenanceTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [maintenanceTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [maintenanceTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const legioTarifsRelations = relations(legioTarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [legioTarifs.entrepriseId],
    references: [entreprises.id],
  }),
}));

export const q18TarifsRelations = relations(q18Tarifs, ({ one }) => ({
  entreprise: one(entreprises, {
    fields: [q18Tarifs.entrepriseId],
    references: [entreprises.id],
  }),
}));

export const qualiteAirTarifsRelations = relations(
  qualiteAirTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [qualiteAirTarifs.entrepriseId],
      references: [entreprises.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// NETTOYAGE RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const nettoyageTarifsRelations = relations(
  nettoyageTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [nettoyageTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [nettoyageTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const nettoyageRepasseTarifsRelations = relations(
  nettoyageRepasseTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [nettoyageRepasseTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [nettoyageRepasseTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

export const nettoyageVitrerieTarifsRelations = relations(
  nettoyageVitrerieTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [nettoyageVitrerieTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [nettoyageVitrerieTarifs.imageId],
      references: [documents.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// OFFICE MANAGER RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const officeManagerTarifsRelations = relations(
  officeManagerTarifs,
  ({ one }) => ({
    entreprise: one(entreprises, {
      fields: [officeManagerTarifs.entrepriseId],
      references: [entreprises.id],
    }),
    image: one(documents, {
      fields: [officeManagerTarifs.imageId],
      references: [documents.id],
    }),
  }),
);
