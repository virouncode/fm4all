import { SelectSiteType, SiteTreeNode } from "@/zod-schemas/sites.schema";

/**
 * BUILD TREE: Construire l'arbre depuis une liste plate
 *
 * Algorithme:
 * 1. Créer un map id -> node
 * 2. Parcourir tous les sites
 * 3. Si parentId null -> racine
 * 4. Sinon -> ajouter aux children du parent
 * 5. Trier récursivement par nom
 */
export function buildSiteTree(sites: SelectSiteType[]): SiteTreeNode[] {
  const map = new Map<string, SiteTreeNode>();
  const roots: SiteTreeNode[] = [];

  // 1. Créer tous les nodes
  for (const site of sites) {
    map.set(site.id, { ...site, children: [] });
  }

  // 2. Construire la hiérarchie
  for (const site of sites) {
    const node = map.get(site.id)!;

    if (site.parentId === null) {
      // Racine
      roots.push(node);
    } else {
      // Enfant
      const parent = map.get(site.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent manquant (ne devrait pas arriver) — traiter comme racine
        roots.push(node);
      }
    }
  }

  // 3. Trier récursivement par nom
  function sortChildren(node: SiteTreeNode) {
    node.children.sort((a, b) => a.nom.localeCompare(b.nom));
    node.children.forEach(sortChildren);
  }

  roots.sort((a, b) => a.nom.localeCompare(b.nom));
  roots.forEach(sortChildren);

  return roots;
}

/**
 * FIND NODE IN TREE: Recherche récursive d'un nœud
 */
export function findSiteInTree(
  tree: SiteTreeNode[],
  siteId: string
): SiteTreeNode | null {
  for (const node of tree) {
    if (node.id === siteId) {
      return node;
    }
    const found = findSiteInTree(node.children, siteId);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * GET ALL DESCENDANT IDS: Récupère tous les IDs descendants (y compris self)
 */
export function getAllDescendantIds(node: SiteTreeNode): string[] {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...getAllDescendantIds(child));
  }
  return ids;
}

/**
 * GET PATH TO ROOT: Retourne le chemin depuis la racine jusqu'au site
 */
export function getPathToRoot(
  tree: SiteTreeNode[],
  siteId: string
): SiteTreeNode[] {
  function findPath(
    nodes: SiteTreeNode[],
    targetId: string,
    path: SiteTreeNode[]
  ): SiteTreeNode[] | null {
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

  return findPath(tree, siteId, []) || [];
}
