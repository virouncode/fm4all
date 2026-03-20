import { roundEffectif } from "@/lib/utils/roundEffectif";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useTotalCafeStore } from "@/stores/devis/totalCafeStore";
import { useTotalSnacksFruitsStore } from "@/stores/devis/totalSnacksFruitsStore";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites.schema";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs.schema";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs.schema";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites.schema";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs.schema";
import { gammes } from "@/zod-schemas/gamme.schema";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites.schema";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs.schema";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import { SnacksFruitsPropositionItem } from "./(desktop)/SnacksFruitsPropositionCard";
import SnacksFruitsDesktopPropositions from "./(desktop)/SnacksFruitsDesktopPropositions";
import SnacksFruitsMobilePropositions from "./(mobile)/SnacksFruitsMobilePropositions";

type SnacksFruitsPropositionsType = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
};

const SnacksFruitsPropositions = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsPropositionsType) => {
  const { snacksFruits, setSnacksFruits } = useSnacksFruitsStore(
    useShallow((s) => ({
      snacksFruits: s.snacksFruits,
      setSnacksFruits: s.setSnacksFruits,
    })),
  );
  const setTotalSnacksFruits = useTotalSnacksFruitsStore(
    (s) => s.setTotalSnacksFruits,
  );
  const resetTotalSnakcFruits = useTotalSnacksFruitsStore((s) => s.reset);
  const prospect = useProspectStore((s) => s.prospect);
  const cafe = useCafeStore((s) => s.cafe);
  const totalCafe = useTotalCafeStore((s) => s.totalCafe);
  const effectif = prospect.effectif ?? 0;
  const nbPersonnes = snacksFruits.quantites.nbPersonnes ?? effectif;

  //Calcul des propositions
  const fruitsTarifsPourNbPersonnes = fruitsTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes),
  );
  const snacksTarifsPourNbPersonnes = snacksTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes),
  );
  const boissonsTarifsPourNbPersonnes = boissonsTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes),
  );

  const propositions = fruitsTarifsPourNbPersonnes.map((item) => {
    const {
      id,
      gamme,
      nomPrestataire,
      slogan: sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      entrepriseId,
      prixKg,
    } = item;
    //Quantites /  semaine / personne
    const gFruitsParSemaineParPersonne =
      fruitsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.gParSemaineParPersonne ?? null;
    const minKgFruitsParSemaine =
      fruitsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minKgParSemaine ?? null;
    const portionsSnacksParSemaineParPersonne =
      snacksQuantites.find((quantite) => quantite.gamme === gamme)
        ?.portionsParSemaineParPersonne ?? null;
    const minPortionsSnacksParSemaine =
      snacksQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minPortionsParSemaine ?? null;
    const consosBoissonsParSemaineParPersonne =
      boissonsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.consosParSemaineParPersonne ?? null;
    const minConsosBoissonsParSemaine =
      boissonsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minConsosParSemaine ?? null;

    const fruitsKgParSemaine =
      gFruitsParSemaineParPersonne !== null && minKgFruitsParSemaine !== null
        ? Math.max(
            (gFruitsParSemaineParPersonne * nbPersonnes) / 1000,
            minKgFruitsParSemaine,
          )
        : null;

    const snacksPortionsParSemaine =
      portionsSnacksParSemaineParPersonne !== null &&
      minPortionsSnacksParSemaine !== null
        ? Math.max(
            portionsSnacksParSemaineParPersonne * nbPersonnes,
            minPortionsSnacksParSemaine,
          )
        : null;
    const boissonsConsosParSemaine =
      consosBoissonsParSemaineParPersonne !== null &&
      minConsosBoissonsParSemaine !== null
        ? Math.max(
            consosBoissonsParSemaineParPersonne * nbPersonnes,
            minConsosBoissonsParSemaine,
          )
        : null;
    const isSamePrestataire = entrepriseId === cafe.infos.entrepriseId;

    //Tarifs / portion
    const prixKgFruits = prixKg;
    const prixUnitaireSnacks =
      snacksTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.entrepriseId === entrepriseId,
      )?.prixUnitaire ?? null;
    const prixUnitaireBoissons =
      boissonsTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.entrepriseId === entrepriseId,
      )?.prixUnitaire ?? null;

    //Prix panier
    const panierFruits =
      snacksFruits.infos.choix.includes("fruits") &&
      prixKgFruits !== null &&
      fruitsKgParSemaine !== null
        ? prixKgFruits * fruitsKgParSemaine
        : 0;
    const panierSnacks =
      snacksFruits.infos.choix.includes("snacks") &&
      prixUnitaireSnacks !== null &&
      snacksPortionsParSemaine !== null
        ? prixUnitaireSnacks * snacksPortionsParSemaine
        : 0;
    const panierBoissons =
      snacksFruits.infos.choix.includes("boissons") &&
      prixUnitaireBoissons !== null &&
      boissonsConsosParSemaine !== null
        ? prixUnitaireBoissons * boissonsConsosParSemaine
        : 0;
    const totalFruits = 52 * panierFruits;
    const totalSnacks = 52 * panierSnacks;
    const totalBoissons = 52 * panierBoissons;

    //Prix livraison / panier
    const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
      (tarif) => tarif.entrepriseId === entrepriseId,
    );
    const remiseSiCafe = isSamePrestataire
      ? (fraisLivraisonsFournisseur?.remiseSiCafe ?? 0)
      : 0;
    const prixPanierSansRemise = panierFruits + panierSnacks + panierBoissons;
    const prixPanier =
      (1 - remiseSiCafe / 100) * (panierFruits + panierSnacks + panierBoissons);

    const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
    const totalCafeAnnuel =
      totalCafe.totalEspaces.length > 0
        ? totalCafe.totalEspaces
            .map(({ total }) => total ?? 0)
            .reduce((acc, curr) => acc + curr, 0)
        : 0;
    const isPanierMin =
      panierMin === null || prixPanier + totalCafeAnnuel / 12 >= panierMin;

    const prixUnitaireLivraisonSiCafe = isPanierMin
      ? (fraisLivraisonsFournisseur?.prixUnitaireSiCafe ?? null)
      : null;
    const prixUnitaireLivraison = isPanierMin
      ? (fraisLivraisonsFournisseur?.prixUnitaire ?? null)
      : null;

    let fraisLivraisonPanier = isSamePrestataire
      ? prixUnitaireLivraisonSiCafe
      : prixUnitaireLivraison;

    const seuilFranco = fraisLivraisonsFournisseur?.seuilFranco ?? 0;

    fraisLivraisonPanier = isPanierMin
      ? prixPanier < seuilFranco
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
      //infos
      id,
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      isSamePrestataire,
      gamme,
      //quantites
      fruitsKgParSemaine,
      snacksPortionsParSemaine,
      boissonsConsosParSemaine,
      gFruitsParSemaineParPersonne,
      portionsSnacksParSemaineParPersonne,
      consosBoissonsParSemaineParPersonne,
      //prix
      prixKgFruits,
      prixUnitaireSnacks,
      prixUnitaireBoissons,
      prixUnitaireLivraisonSiCafe,
      prixUnitaireLivraison,
      seuilFranco,
      fraisLivraisonPanier,
      panierMin,
      //total
      total,
      totalSansRemise,
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<string, SnacksFruitsPropositionItem[]>
  >((acc, item) => {
    const { entrepriseId } = item;
    if (!acc[entrepriseId]) {
      acc[entrepriseId] = [];
    }
    // Add the item to the appropriate array
    acc[entrepriseId].push(item);
    acc[entrepriseId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme),
    );
    return acc;
  }, {});

  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: SnacksFruitsPropositionItem) => {
    const {
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      isSamePrestataire,
      gamme,
      fruitsKgParSemaine,
      snacksPortionsParSemaine,
      boissonsConsosParSemaine,
      prixKgFruits,
      prixUnitaireSnacks,
      prixUnitaireBoissons,
      prixUnitaireLivraisonSiCafe,
      prixUnitaireLivraison,
      seuilFranco,
      panierMin,
      total,
      totalSansRemise,
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
    } = proposition;

    if (
      snacksFruits.infos.entrepriseId === proposition.entrepriseId &&
      snacksFruits.infos.gammeSelected === proposition.gamme
    ) {
      setSnacksFruits((prev) => ({
        infos: {
          ...prev.infos,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          isSamePrestataire: false,
          gammeSelected: null,
        },
        quantites: {
          ...prev.quantites,
          fruitsKgParSemaine: null,
          snacksPortionsParSemaine: null,
          boissonsConsosParSemaine: null,
        },
        prix: {
          prixKgFruits: null,
          prixUnitaireSnacks: null,
          prixUnitaireBoissons: null,
          prixUnitaireLivraisonSiCafe: null,
          prixUnitaireLivraison: null,
          seuilFranco: null,
          panierMin: null,
        },
      }));
      resetTotalSnakcFruits();
      return;
    }
    setSnacksFruits((prev) => ({
      infos: {
        ...prev.infos,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        isSamePrestataire,
        gammeSelected: gamme,
      },
      quantites: {
        ...prev.quantites,
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
    }));
    setTotalSnacksFruits({
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
      total,
      totalSansRemise,
    });
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <SnacksFruitsMobilePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <SnacksFruitsDesktopPropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default SnacksFruitsPropositions;
