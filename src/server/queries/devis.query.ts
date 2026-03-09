import "server-only";

import { db } from "@/db";
import { devis, devisLignes } from "@/db/schema/devis";
import { entreprises } from "@/db/schema/entreprises";
import { documents, documentsLinks } from "@/db/schema/documents";
import { sites } from "@/db/schema/sites";
import { user } from "@/db/schema/auth";
import type {
  SelectDevisLigneType,
  SelectDevisType,
  DevisQueryType,
} from "@/zod-schemas/devis.schema";
import { and, asc, count, desc, eq, ilike, isNull, or, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// ============================= TYPES ENRICHIS ==============================//

export type DevisAvecDetails = SelectDevisType & {
  proprietaireEntrepriseNom: string;
  emetteurEntrepriseNom: string;
  siteNom: string;
  createdByPrenom: string | null;
  createdByNom: string | null;
};

export type DevisAvecLignes = SelectDevisType & {
  lignes: SelectDevisLigneType[];
  proprietaireEntrepriseNom: string;
  emetteurEntrepriseNom: string;
  proprietaireEntrepriseNumeroTva: string | null;
  emetteurEntrepriseNumeroTva: string | null;
  proprietaireEntrepriseSiret: string;
  emetteurEntrepriseSiret: string;
  emetteurEmailContact: string | null;
  emetteurPhoneContact: string | null;
  emetteurPrenomContact: string | null;
  emetteurNomContact: string | null;
  emetteurLogoStorageKey: string | null;
  pdfStorageKey: string | null;
  siteNom: string;
  siteAdresse: string;
  siteCodePostal: string;
  siteVille: string;
};

// ============================= QUERIES ==============================//

/**
 * Récupère un devis par ID avec toutes ses infos (pour l'édition et le preview PDF).
 */
export async function getDevisById(
  devisId: string,
): Promise<DevisAvecLignes | null> {
  const proprietaire = alias(entreprises, "proprietaire");
  const emetteur = alias(entreprises, "emetteur");
  const emetteurLogo = alias(documents, "emetteurLogo");

  const row = await db
    .select({
      devis: devis,
      proprietaireEntrepriseNom: proprietaire.nom,
      proprietaireEntrepriseNumeroTva: proprietaire.numeroTva,
      proprietaireEntrepriseSiret: proprietaire.siret,
      emetteurEntrepriseNom: emetteur.nom,
      emetteurEntrepriseNumeroTva: emetteur.numeroTva,
      emetteurEntrepriseSiret: emetteur.siret,
      emetteurEmailContact: emetteur.emailContact,
      emetteurPhoneContact: emetteur.phoneContact,
      emetteurPrenomContact: emetteur.prenomContact,
      emetteurNomContact: emetteur.nomContact,
      emetteurLogoStorageKey: emetteurLogo.storageKey,
      siteNom: sites.nom,
      siteAdresse: sites.adresseLigne1,
      siteCodePostal: sites.codePostal,
      siteVille: sites.ville,
    })
    .from(devis)
    .innerJoin(proprietaire, eq(devis.proprietaireEntrepriseId, proprietaire.id))
    .innerJoin(emetteur, eq(devis.emetteurEntrepriseId, emetteur.id))
    .innerJoin(sites, eq(devis.siteId, sites.id))
    .leftJoin(emetteurLogo, eq(emetteur.logoId, emetteurLogo.id))
    .where(eq(devis.id, devisId))
    .limit(1);

  if (!row.length) return null;

  const lignes = await db
    .select()
    .from(devisLignes)
    .where(eq(devisLignes.devisId, devisId))
    .orderBy(asc(devisLignes.ordre));

  // Récupérer le PDF du devis si existant
  const pdfDoc = await db
    .select({ storageKey: documents.storageKey })
    .from(documentsLinks)
    .innerJoin(documents, eq(documentsLinks.documentId, documents.id))
    .where(
      and(
        eq(documentsLinks.devisId, devisId),
        eq(documents.categorie, "devis"),
        isNull(documentsLinks.ticketId),
      ),
    )
    .limit(1);

  const r = row[0];
  return {
    ...r.devis,
    proprietaireEntrepriseNom: r.proprietaireEntrepriseNom,
    emetteurEntrepriseNom: r.emetteurEntrepriseNom,
    proprietaireEntrepriseNumeroTva: r.proprietaireEntrepriseNumeroTva,
    emetteurEntrepriseNumeroTva: r.emetteurEntrepriseNumeroTva,
    proprietaireEntrepriseSiret: r.proprietaireEntrepriseSiret,
    emetteurEntrepriseSiret: r.emetteurEntrepriseSiret,
    emetteurEmailContact: r.emetteurEmailContact,
    emetteurPhoneContact: r.emetteurPhoneContact,
    emetteurPrenomContact: r.emetteurPrenomContact,
    emetteurNomContact: r.emetteurNomContact,
    emetteurLogoStorageKey: r.emetteurLogoStorageKey,
    pdfStorageKey: pdfDoc[0]?.storageKey ?? null,
    siteNom: r.siteNom,
    siteAdresse: r.siteAdresse,
    siteCodePostal: r.siteCodePostal,
    siteVille: r.siteVille,
    lignes,
  };
}

/**
 * Liste les devis avec filtres et pagination.
 */
export async function getDevisPaginated(
  query: DevisQueryType,
  scopeCondition?: SQL,
): Promise<{ items: DevisAvecDetails[]; total: number }> {
  const proprietaire = alias(entreprises, "proprietaire");
  const emetteur = alias(entreprises, "emetteur");
  const createdByUser = alias(user, "createdByUser");

  const conditions: SQL[] = [];
  if (scopeCondition) conditions.push(scopeCondition);
  if (query.statut) conditions.push(eq(devis.statut, query.statut));
  if (query.siteId) conditions.push(eq(devis.siteId, query.siteId));
  if (query.search) {
    const term = `%${query.search}%`;
    conditions.push(
      or(ilike(devis.titre, term), ilike(devis.numero, term)) as SQL,
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderColumn = (() => {
    switch (query.orderBy) {
      case "numero":
        return devis.numero;
      case "titre":
        return devis.titre;
      case "statut":
        return devis.statut;
      case "dateEmission":
        return devis.dateEmission;
      case "validTo":
        return devis.validTo;
      default:
        return devis.createdAt;
    }
  })();

  const orderFn = query.orderDir === "asc" ? asc : desc;
  const offset = (query.page - 1) * query.pageSize;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        devis: devis,
        proprietaireEntrepriseNom: proprietaire.nom,
        emetteurEntrepriseNom: emetteur.nom,
        siteNom: sites.nom,
        createdByPrenom: createdByUser.prenom,
        createdByNom: createdByUser.nom,
      })
      .from(devis)
      .innerJoin(proprietaire, eq(devis.proprietaireEntrepriseId, proprietaire.id))
      .innerJoin(emetteur, eq(devis.emetteurEntrepriseId, emetteur.id))
      .innerJoin(sites, eq(devis.siteId, sites.id))
      .leftJoin(createdByUser, eq(devis.createdById, createdByUser.id))
      .where(where)
      .orderBy(orderFn(orderColumn))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(devis)
      .innerJoin(proprietaire, eq(devis.proprietaireEntrepriseId, proprietaire.id))
      .innerJoin(emetteur, eq(devis.emetteurEntrepriseId, emetteur.id))
      .innerJoin(sites, eq(devis.siteId, sites.id))
      .where(where),
  ]);

  return {
    items: rows.map((r) => ({
      ...r.devis,
      proprietaireEntrepriseNom: r.proprietaireEntrepriseNom,
      emetteurEntrepriseNom: r.emetteurEntrepriseNom,
      siteNom: r.siteNom,
      createdByPrenom: r.createdByPrenom ?? null,
      createdByNom: r.createdByNom ?? null,
    })),
    total,
  };
}

/**
 * Récupère les lignes d'un devis ordonnées.
 */
export async function getDevisLignes(
  devisId: string,
): Promise<SelectDevisLigneType[]> {
  return db
    .select()
    .from(devisLignes)
    .where(eq(devisLignes.devisId, devisId))
    .orderBy(asc(devisLignes.ordre));
}
