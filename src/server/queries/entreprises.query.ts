import "server-only";

import { db } from "@/db";
import { entreprises, entrepriseRoles } from "@/db/schema/entreprises";
import { eq, and } from "drizzle-orm";
import type { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";

/**
 * Récupère toutes les entreprises ayant le rôle "client"
 * Utilisé par la plateforme pour sélectionner le client lors de la création d'un ticket
 *
 * @returns Liste des entreprises clientes avec id et nom
 */
export async function getEntreprisesClientes(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .innerJoin(
      entrepriseRoles,
      eq(entreprises.id, entrepriseRoles.entrepriseId),
    )
    .where(eq(entrepriseRoles.role, "client"))
    .orderBy(entreprises.nom);

  return results;
}

/**
 * Récupère une entreprise par ID
 *
 * @param entrepriseId - ID de l'entreprise
 * @returns L'entreprise ou null si non trouvée
 */
export async function getEntrepriseById(entrepriseId: string) {
  const entreprise = await db.query.entreprises.findFirst({
    where: eq(entreprises.id, entrepriseId),
  });

  return entreprise || null;
}

/**
 * Récupère toutes les entreprises
 * Retourne id et nom uniquement pour optimisation
 *
 * @returns Liste de toutes les entreprises avec id et nom
 */
export async function getAllEntreprises(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .orderBy(entreprises.nom);

  return results;
}

/**
 * Vérifie si une entreprise possède un rôle spécifique
 *
 * @param entrepriseId - ID de l'entreprise
 * @param role - Rôle à vérifier (client, prestataire, plateforme)
 * @returns true si l'entreprise possède le rôle
 */
export async function hasEntrepriseRole(
  entrepriseId: string,
  role: RoleEntrepriseType
): Promise<boolean> {
  const result = await db.query.entrepriseRoles.findFirst({
    where: and(
      eq(entrepriseRoles.entrepriseId, entrepriseId),
      eq(entrepriseRoles.role, role)
    ),
  });

  return !!result;
}

/**
 * Récupère toutes les entreprises ayant le rôle "prestataire"
 * Utilisé pour le filtre prestataire dans les tickets
 *
 * @returns Liste des entreprises prestataires avec id et nom
 */
export async function getEntreprisesPrestataires(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .innerJoin(
      entrepriseRoles,
      eq(entreprises.id, entrepriseRoles.entrepriseId),
    )
    .where(eq(entrepriseRoles.role, "prestataire"))
    .orderBy(entreprises.nom);

  return results;
}
