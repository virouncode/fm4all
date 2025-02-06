import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { useContext } from "react";
import SnackFruitsPropositionLogo from "./SnackFruitsPropositionLogo";
import SnacksFruitsPropositionCard from "./SnacksFruitsPropositionCard";

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
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const effectif = client.effectif ?? 0;
  const nbPersonnes = snacksFruits.quantites.nbPersonnes || effectif;

  //Calcul des propositions
  const fruitsTarifsPourNbPersonnes = fruitsTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes)
  );
  const snacksTarifsPourNbPersonnes = snacksTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes)
  );
  const boissonsTarifsPourNbPersonnes = boissonsTarifs.filter(
    (item) => item.effectif === roundEffectif(nbPersonnes)
  );

  const propositions = fruitsTarifsPourNbPersonnes.map((item) => {
    const {
      id,
      gamme,
      nomFournisseur,
      slogan: sloganFournisseur,
      fournisseurId,
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
        ? (gFruitsParSemaineParPersonne * nbPersonnes) / 1000 >=
          (minKgFruitsParSemaine ?? 0)
          ? (gFruitsParSemaineParPersonne * nbPersonnes) / 1000
          : minKgFruitsParSemaine
        : null;
    const snacksPortionsParSemaine =
      portionsSnacksParSemaineParPersonne !== null &&
      minPortionsSnacksParSemaine !== null
        ? portionsSnacksParSemaineParPersonne * nbPersonnes >=
          minPortionsSnacksParSemaine
          ? portionsSnacksParSemaineParPersonne * nbPersonnes
          : minPortionsSnacksParSemaine
        : null;
    const boissonsConsosParSemaine =
      consosBoissonsParSemaineParPersonne !== null &&
      minConsosBoissonsParSemaine !== null
        ? consosBoissonsParSemaineParPersonne * nbPersonnes >=
          minConsosBoissonsParSemaine
          ? consosBoissonsParSemaineParPersonne * nbPersonnes
          : minConsosBoissonsParSemaine
        : null;

    //Tarifs / portion
    const prixKgFruits = prixKg;
    const prixUnitaireSnacks =
      snacksTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.fournisseurId === fournisseurId
      )?.prixUnitaire ?? null;
    const prixUnitaireBoissons =
      boissonsTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.fournisseurId === fournisseurId
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

    const prixPanier = panierFruits + panierSnacks + panierBoissons;

    //Prix livraison / panier
    const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
    const isPanierMin = panierMin === null || prixPanier >= panierMin;

    const isSameFournisseur = fournisseurId === cafe.infos.fournisseurId;
    const prixUnitaireLivraisonSiCafe = isPanierMin
      ? fraisLivraisonsFournisseur?.prixUnitaireSiCafe ?? null
      : null;
    const prixUnitaireLivraison = isPanierMin
      ? fraisLivraisonsFournisseur?.prixUnitaire ?? null
      : null;

    let fraisLivraisonPanier = isSameFournisseur
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
      fraisLivraisonPanier !== null
        ? 52 * (prixPanier + fraisLivraisonPanier)
        : null;

    return {
      //infos
      id,
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      isSameFournisseur,
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
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      number,
      {
        id: number;
        fournisseurId: number;
        nomFournisseur: string;
        sloganFournisseur: string | null;
        isSameFournisseur: boolean;
        gamme: GammeType;
        fruitsKgParSemaine: number | null;
        snacksPortionsParSemaine: number | null;
        boissonsConsosParSemaine: number | null;
        gFruitsParSemaineParPersonne: number | null;
        portionsSnacksParSemaineParPersonne: number | null;
        consosBoissonsParSemaineParPersonne: number | null;
        prixKgFruits: number | null;
        prixUnitaireSnacks: number | null;
        prixUnitaireBoissons: number | null;
        prixUnitaireLivraisonSiCafe: number | null;
        prixUnitaireLivraison: number | null;
        seuilFranco: number;
        fraisLivraisonPanier: number | null;
        panierMin: number | null;
        total: number | null;
        totalFruits: number;
        totalSnacks: number;
        totalBoissons: number;
        totalLivraison: number | null;
      }[]
    >
  >((acc, item) => {
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme)
    );
    return acc;
  }, {});

  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    isSameFournisseur: boolean;
    gamme: GammeType;
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      isSameFournisseur,
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
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
    } = proposition;

    if (
      snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
      snacksFruits.infos.gammeSelected === proposition.gamme
    ) {
      setSnacksFruits((prev) => ({
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          isSameFournisseur: false,
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
      setTotalSnacksFruits({
        totalFruits: null,
        totalSnacks: null,
        totalBoissons: null,
        totalLivraison: null,
        total: null,
      });
      return;
    }
    setSnacksFruits((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        isSameFournisseur,
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
    });
  };

  if (snacksFruits.infos.choix.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-xl overflow-hidden">
        <p>Nous n&apos;avons pas d&apos;offres correspondant à ces critères</p>
        <p>
          Veuillez choisir au moins une valeur parmi &quot;fruits, snacks et
          boissons&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <SnackFruitsPropositionLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <SnacksFruitsPropositionCard
                  key={proposition.id}
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

export default SnacksFruitsPropositions;
