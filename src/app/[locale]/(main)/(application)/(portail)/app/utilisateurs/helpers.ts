import {
  UserWithAdhesionType,
  UserTreeNode,
} from "@/zod-schemas/user.schema";
import type { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import type { RoleClientAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import type { RoleClientAttributionType } from "@/zod-schemas/userSiteAttribution.schema";
import type { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";

/**
 * BUILD TREE: Construire l'arbre depuis une liste plate
 *
 * Algorithme:
 * 1. Créer un map id -> node
 * 2. Parcourir tous les utilisateurs
 * 3. Si parentId null -> racine
 * 4. Sinon -> ajouter aux children du parent
 * 5. Trier récursivement par nom
 */
export function buildUserTree(users: UserWithAdhesionType[]): UserTreeNode[] {
  const map = new Map<string, UserTreeNode>();
  const roots: UserTreeNode[] = [];

  // 1. Créer tous les nodes
  for (const user of users) {
    map.set(user.id, {
      ...user,
      adhesion: user.adhesion,
      children: [],
    });
  }

  // 2. Construire la hiérarchie
  for (const user of users) {
    const node = map.get(user.id)!;

    if (user.parentId === null) {
      // Racine
      roots.push(node);
    } else {
      // Enfant
      const parent = map.get(user.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent manquant (ne devrait pas arriver) — traiter comme racine
        roots.push(node);
      }
    }
  }

  // 3. Trier récursivement par nom
  function sortChildren(node: UserTreeNode) {
    node.children.sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`),
    );
    node.children.forEach(sortChildren);
  }

  roots.sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`),
  );
  roots.forEach(sortChildren);

  return roots;
}

/**
 * FIND NODE IN TREE: Recherche récursive d'un nœud
 */
export function findUserInTree(
  tree: UserTreeNode[],
  userId: string,
): UserTreeNode | null {
  for (const node of tree) {
    if (node.id === userId) {
      return node;
    }
    const found = findUserInTree(node.children, userId);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * GET ALL DESCENDANT IDS: Récupère tous les IDs descendants (y compris self)
 */
export function getAllDescendantIds(node: UserTreeNode): string[] {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...getAllDescendantIds(child));
  }
  return ids;
}

/**
 * GET PATH TO ROOT: Retourne le chemin depuis la racine jusqu'à l'utilisateur
 */
export function getPathToRoot(
  tree: UserTreeNode[],
  userId: string,
): UserTreeNode[] {
  function findPath(
    nodes: UserTreeNode[],
    targetId: string,
    path: UserTreeNode[],
  ): UserTreeNode[] | null {
    for (const node of nodes) {
      if (node.id === targetId) {
        return [...path, node];
      }
      const found = findPath(node.children, targetId, [...path, node]);
      if (found) {
        return found;
      }
    }
    return null;
  }

  return findPath(tree, userId, []) || [];
}

// ============================================
// SITE ATTRIBUTION HELPERS
// ============================================

/**
 * FILTRER RÔLES PAR POSTURE
 * Retourne les rôles disponibles selon la posture active
 */
export function getAvailableRolesByPosture(
  posture: RoleEntrepriseType | null,
): RoleClientAttributionType[] {
  if (!posture) return [];

  const rolesByPosture: Record<RoleEntrepriseType, RoleClientAttributionType[]> = {
    client: [
      "responsable_site",
      "demandeur_site",
      "observateur_site",
    ],
    prestataire: [
      "responsable_site",
      "observateur_site",
    ],
    plateforme: [
      "responsable_site",
      "demandeur_site",
      "observateur_site",
    ],
  };

  return rolesByPosture[posture] || [];
}

/**
 * FILTRER RÔLES PAR POSTURE ET NIVEAU D'UTILISATEUR
 * Combine le filtrage par posture ET par roleAdhesion
 *
 * Cette fonction applique 2 niveaux de filtrage :
 * 1. Par posture (client/prestataire/plateforme)
 * 2. Par niveau de l'utilisateur (admin/manager/collaborateur)
 *
 * Règles :
 * - Admin/Super Admin/Manager : Tous les rôles de la posture
 * - Collaborateur : UNIQUEMENT demandeur_site et observateur_site (délégation locale)
 */
export function getAvailableRolesByPostureAndLevel(
  posture: RoleEntrepriseType | null,
  roleAdhesion: RoleClientAdhesionType | null,
  rolePlateformeAdhesion?: RolePlateformeAdhesionType | null,
): RoleClientAttributionType[] {
  if (!posture || (!roleAdhesion && !rolePlateformeAdhesion)) return [];

  // Étape 1 : Filtrer par posture (existant)
  const rolesByPosture = getAvailableRolesByPosture(posture);

  // Étape 2 : Filtrer par niveau de roleAdhesion
  // Platform super admin, Admin et Manager : Aucune restriction supplémentaire
  if (
    rolePlateformeAdhesion === "super_admin_plateforme" ||
    roleAdhesion === "admin" ||
    roleAdhesion === "manager"
  ) {
    return rolesByPosture;
  }

  // Collaborateur : UNIQUEMENT demandeur_site et observateur_site (délégation locale)
  if (roleAdhesion === "collaborateur") {
    return rolesByPosture.filter((role) =>
      ["demandeur_site", "observateur_site"].includes(role),
    );
  }

  return [];
}

/**
 * LABELS DES RÔLES
 */
export const roleLabels: Record<string, string> = {
  responsable_site: "Responsable",
  demandeur_site: "Demandeur",
  observateur_site: "Observateur",
};

/**
 * LABELS DES SCOPES
 */
export const scopeLabels: Record<"self" | "subtree", string> = {
  self: "Site uniquement",
  subtree: "Site + sous-sites",
};

/**
 * COULEURS DES BADGES PAR RÔLE
 */
export const roleColors: Record<string, string> = {
  responsable_site: "bg-purple-100 text-purple-800",
  demandeur_site: "bg-green-100 text-green-800",
  observateur_site: "bg-gray-100 text-gray-800",
};
