import { SnacksFruitsType } from "@/zod-schemas/snacksFruits.schema";
import { TotalSnacksFruitsType } from "@/zod-schemas/total.schema";

export function calcSnacksFruitsTotaux(
  snacksFruits: SnacksFruitsType,
  totalCafeAnnuel: number,
): TotalSnacksFruitsType {
  const {
    infos: { choix, isSamePrestataire },
    quantites: {
      nbPersonnes,
      fruitsKgParSemaine,
      snacksPortionsParSemaine,
      boissonsConsosParSemaine,
    },
    prix: {
      prixKgFruits,
      prixUnitaireSnacks,
      prixUnitaireBoissons,
      prixUnitaireLivraisonSiCafe,
      prixUnitaireLivraison,
      seuilFranco,
      panierMin,
    },
  } = snacksFruits;

  if (!nbPersonnes) {
    return {
      totalFruits: null,
      totalSnacks: null,
      totalBoissons: null,
      totalLivraison: null,
      total: null,
      totalSansRemise: null,
    };
  }

  const panierFruits =
    choix.includes("fruits") &&
    prixKgFruits !== null &&
    fruitsKgParSemaine !== null
      ? prixKgFruits * fruitsKgParSemaine
      : 0;

  const panierSnacks =
    choix.includes("snacks") &&
    prixUnitaireSnacks !== null &&
    snacksPortionsParSemaine !== null
      ? prixUnitaireSnacks * snacksPortionsParSemaine
      : 0;

  const panierBoissons =
    choix.includes("boissons") &&
    prixUnitaireBoissons !== null &&
    boissonsConsosParSemaine !== null
      ? prixUnitaireBoissons * boissonsConsosParSemaine
      : 0;

  const totalFruits = 52 * panierFruits;
  const totalSnacks = 52 * panierSnacks;
  const totalBoissons = 52 * panierBoissons;

  const prixPanierSansRemise = panierFruits + panierSnacks + panierBoissons;
  const prixPanier = prixPanierSansRemise; // remise applied at selection time via isSamePrestataire, stored in prix

  // Determine if panier meets minimum
  const isPanierMin =
    panierMin === null || prixPanier + totalCafeAnnuel / 12 >= panierMin;

  // Determine livraison frais based on same prestataire
  let fraisLivraisonPanier: number | null = isSamePrestataire
    ? (prixUnitaireLivraisonSiCafe ?? null)
    : (prixUnitaireLivraison ?? null);

  fraisLivraisonPanier = isPanierMin
    ? prixPanier < (seuilFranco ?? 0)
      ? fraisLivraisonPanier
      : 0
    : null;

  const totalLivraison =
    fraisLivraisonPanier !== null ? fraisLivraisonPanier * 52 : null;

  const total =
    fraisLivraisonPanier !== null && nbPersonnes
      ? 52 * (prixPanier + fraisLivraisonPanier)
      : null;

  const totalSansRemise =
    fraisLivraisonPanier !== null && nbPersonnes
      ? 52 * (prixPanierSansRemise + fraisLivraisonPanier)
      : null;

  return {
    totalFruits: totalFruits || null,
    totalSnacks: totalSnacks || null,
    totalBoissons: totalBoissons || null,
    totalLivraison,
    total,
    totalSansRemise,
  };
}
