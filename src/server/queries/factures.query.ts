import "server-only";

import { db } from "@/db";
import { factureLignes, factures } from "@/db/schema/factures";
import { entreprises } from "@/db/schema/entreprises";
import { documents, documentsLinks } from "@/db/schema/documents";
import { sites } from "@/db/schema/sites";
import { user } from "@/db/schema/auth";
import type {
  FactureQueryType,
  SelectFactureLigneType,
  SelectFactureType,
} from "@/zod-schemas/factures.schema";
import { and, asc, count, desc, eq, ilike, isNull, or, SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// ============================= TYPES ENRICHIS ==============================//

export type FactureAvecDetails = SelectFactureType & {
  destinataireEntrepriseNom: string;
  emetteurEntrepriseNom: string;
  siteNom: string | null;
  createdByPrenom: string | null;
  createdByNom: string | null;
};

export type FactureAvecLignes = SelectFactureType & {
  lignes: SelectFactureLigneType[];
  emetteurEntrepriseNom: string;
  emetteurEntrepriseNumeroTva: string | null;
  emetteurEntrepriseSiret: string;
  emetteurEmailContact: string | null;
  emetteurPhoneContact: string | null;
  emetteurPrenomContact: string | null;
  emetteurNomContact: string | null;
  emetteurLogoStorageKey: string | null;
  destinataireEntrepriseNom: string;
  destinataireEntrepriseNumeroTva: string | null;
  destinataireEntrepriseSiret: string;
  siteNom: string | null;
  siteAdresse: string | null;
  siteCodePostal: string | null;
  siteVille: string | null;
  pdfStorageKey: string | null;
};

// ============================= QUERIES ==============================//

/**
 * Récupère une facture par ID avec toutes ses infos (pour l'édition et le preview PDF).
 */
export async function getFactureById(
  factureId: string,
): Promise<FactureAvecLignes | null> {
  const emetteur = alias(entreprises, "emetteur");
  const destinataire = alias(entreprises, "destinataire");
  const emetteurLogo = alias(documents, "emetteurLogo");

  const row = await db
    .select({
      facture: factures,
      emetteurEntrepriseNom: emetteur.nom,
      emetteurEntrepriseNumeroTva: emetteur.numeroTva,
      emetteurEntrepriseSiret: emetteur.siret,
      emetteurEmailContact: emetteur.emailContact,
      emetteurPhoneContact: emetteur.phoneContact,
      emetteurPrenomContact: emetteur.prenomContact,
      emetteurNomContact: emetteur.nomContact,
      emetteurLogoStorageKey: emetteurLogo.storageKey,
      destinataireEntrepriseNom: destinataire.nom,
      destinataireEntrepriseNumeroTva: destinataire.numeroTva,
      destinataireEntrepriseSiret: destinataire.siret,
      siteNom: sites.nom,
      siteAdresse: sites.adresseLigne1,
      siteCodePostal: sites.codePostal,
      siteVille: sites.ville,
    })
    .from(factures)
    .innerJoin(emetteur, eq(factures.emetteurEntrepriseId, emetteur.id))
    .innerJoin(destinataire, eq(factures.destinataireEntrepriseId, destinataire.id))
    .leftJoin(sites, eq(factures.siteId, sites.id))
    .leftJoin(emetteurLogo, eq(emetteur.logoId, emetteurLogo.id))
    .where(eq(factures.id, factureId))
    .limit(1);

  if (!row.length) return null;

  const [lignes, pdfDoc] = await Promise.all([
    db
      .select()
      .from(factureLignes)
      .where(eq(factureLignes.factureId, factureId))
      .orderBy(asc(factureLignes.ordre)),
    db
      .select({ storageKey: documents.storageKey })
      .from(documentsLinks)
      .innerJoin(documents, eq(documentsLinks.documentId, documents.id))
      .where(
        and(
          eq(documentsLinks.factureId, factureId),
          eq(documents.categorie, "facture"),
          isNull(documentsLinks.ticketId),
        ),
      )
      .limit(1),
  ]);

  const r = row[0];

  return {
    ...r.facture,
    emetteurEntrepriseNom: r.emetteurEntrepriseNom,
    emetteurEntrepriseNumeroTva: r.emetteurEntrepriseNumeroTva,
    emetteurEntrepriseSiret: r.emetteurEntrepriseSiret,
    emetteurEmailContact: r.emetteurEmailContact,
    emetteurPhoneContact: r.emetteurPhoneContact,
    emetteurPrenomContact: r.emetteurPrenomContact,
    emetteurNomContact: r.emetteurNomContact,
    emetteurLogoStorageKey: r.emetteurLogoStorageKey,
    destinataireEntrepriseNom: r.destinataireEntrepriseNom,
    destinataireEntrepriseNumeroTva: r.destinataireEntrepriseNumeroTva,
    destinataireEntrepriseSiret: r.destinataireEntrepriseSiret,
    siteNom: r.siteNom,
    siteAdresse: r.siteAdresse,
    siteCodePostal: r.siteCodePostal,
    siteVille: r.siteVille,
    pdfStorageKey: pdfDoc[0]?.storageKey ?? null,
    lignes,
  };
}

/**
 * Liste les factures avec filtres et pagination.
 */
export async function getFacturesPaginated(
  query: FactureQueryType,
  scopeCondition?: SQL,
): Promise<{ items: FactureAvecDetails[]; total: number }> {
  const emetteur = alias(entreprises, "emetteur");
  const destinataire = alias(entreprises, "destinataire");
  const createdByUser = alias(user, "createdByUser");

  const conditions: SQL[] = [];
  if (scopeCondition) conditions.push(scopeCondition);
  if (query.statut) conditions.push(eq(factures.statut, query.statut));
  if (query.modeCommercialSnapshot)
    conditions.push(
      eq(factures.modeCommercialSnapshot, query.modeCommercialSnapshot),
    );
  if (query.siteId) conditions.push(eq(factures.siteId, query.siteId));
  if (query.clientId)
    conditions.push(eq(factures.destinataireEntrepriseId, query.clientId));
  if (query.emetteurId)
    conditions.push(eq(factures.emetteurEntrepriseId, query.emetteurId));
  if (query.serviceId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM facture_lignes fl WHERE fl.facture_id = ${factures.id} AND fl.service_id = ${query.serviceId}::uuid)`,
    );
  }
  if (query.search) {
    const term = `%${query.search}%`;
    conditions.push(
      or(
        ilike(factures.titre, term),
        ilike(factures.numero, term),
        ilike(factures.description, term),
      ) as SQL,
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderColumn = (() => {
    switch (query.orderBy) {
      case "updatedAt":
        return factures.updatedAt;
      case "numero":
        return factures.numero;
      case "titre":
        return factures.titre;
      case "statut":
        return factures.statut;
      case "dateEmission":
        return factures.dateEmission;
      case "dateEcheance":
        return factures.dateEcheance;
      case "montantTtc":
        return factures.montantTtc;
      case "siteNom":
        return sites.nom;
      case "emetteurEntrepriseNom":
        return emetteur.nom;
      case "destinataireEntrepriseNom":
        return destinataire.nom;
      default:
        return factures.createdAt;
    }
  })();

  const orderFn = query.orderDir === "asc" ? asc : desc;
  const offset = (query.page - 1) * query.pageSize;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        facture: factures,
        emetteurEntrepriseNom: emetteur.nom,
        destinataireEntrepriseNom: destinataire.nom,
        siteNom: sites.nom,
        createdByPrenom: createdByUser.prenom,
        createdByNom: createdByUser.nom,
      })
      .from(factures)
      .innerJoin(emetteur, eq(factures.emetteurEntrepriseId, emetteur.id))
      .innerJoin(destinataire, eq(factures.destinataireEntrepriseId, destinataire.id))
      .leftJoin(sites, eq(factures.siteId, sites.id))
      .leftJoin(createdByUser, eq(factures.createdById, createdByUser.id))
      .where(where)
      .orderBy(orderFn(orderColumn))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(factures)
      .innerJoin(emetteur, eq(factures.emetteurEntrepriseId, emetteur.id))
      .innerJoin(destinataire, eq(factures.destinataireEntrepriseId, destinataire.id))
      .leftJoin(sites, eq(factures.siteId, sites.id))
      .where(where),
  ]);

  return {
    items: rows.map((r) => ({
      ...r.facture,
      emetteurEntrepriseNom: r.emetteurEntrepriseNom,
      destinataireEntrepriseNom: r.destinataireEntrepriseNom,
      siteNom: r.siteNom ?? null,
      createdByPrenom: r.createdByPrenom ?? null,
      createdByNom: r.createdByNom ?? null,
    })),
    total,
  };
}

/**
 * Récupère les lignes d'une facture ordonnées.
 */
export async function getFactureLignes(
  factureId: string,
): Promise<SelectFactureLigneType[]> {
  return db
    .select()
    .from(factureLignes)
    .where(eq(factureLignes.factureId, factureId))
    .orderBy(asc(factureLignes.ordre));
}
