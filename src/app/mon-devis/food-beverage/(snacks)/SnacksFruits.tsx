"use client";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { gammes } from "@/zod-schemas/gamme";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { Banana, Cookie, CupSoda } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../mes-services/PropositionsFooter";
import PropositionsTitle from "../../mes-services/PropositionsTitle";
import SnacksFruitsUpdateForm from "./SnackFruitsUpdateForm";
import SnacksFruitsPropositions from "./SnacksFruitsPropositions";

export type SnacksFruitsChoixType = "fruits" | "snacks" | "boissons";

type SnacksFruitsType = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
};

const SnacksFruits = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsType) => {
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe } = useContext(CafeContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);

  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: cafe.infos.fournisseurId
        ? prev.currentFoodBeverageId - 1
        : prev.currentFoodBeverageId - 2,
    }));
  };

  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };

  const nbPersonnes = snacksFruits.quantites.nbPersonnes;
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
        ?.gParSemaineParPersonne ?? 0;
    const minKgFruitsParSemaine =
      fruitsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minKgParSemaine ?? 0;
    const portionsSnacksParSemaineParPersonne =
      snacksQuantites.find((quantite) => quantite.gamme === gamme)
        ?.portionsParSemaineParPersonne ?? 0;
    const minPortionsSnacksParSemaine =
      snacksQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minPortionsParSemaine ?? 0;
    const consosBoissonsParSemaineParPersonne =
      boissonsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.consosParSemaineParPersonne ?? 0;
    const minConsosBoissonsParSemaine =
      boissonsQuantites.find((quantite) => quantite.gamme === gamme)
        ?.minConsosParSemaine ?? 0;

    const fruitsKgParSemaine =
      (gFruitsParSemaineParPersonne * nbPersonnes) / 1000 >=
      minKgFruitsParSemaine
        ? (gFruitsParSemaineParPersonne * nbPersonnes) / 1000
        : minKgFruitsParSemaine;
    const snacksPortionsParSemaine =
      portionsSnacksParSemaineParPersonne * nbPersonnes >=
      minPortionsSnacksParSemaine
        ? portionsSnacksParSemaineParPersonne * nbPersonnes
        : minPortionsSnacksParSemaine;
    const boissonsConsosParSemaine =
      consosBoissonsParSemaineParPersonne * nbPersonnes >=
      minConsosBoissonsParSemaine
        ? consosBoissonsParSemaineParPersonne * nbPersonnes
        : minConsosBoissonsParSemaine;

    //Tarifs / portion
    const prixKgFruits = prixKg ?? 0;
    const prixUnitaireSnacks =
      snacksTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.fournisseurId === fournisseurId
      )?.prixUnitaire ?? 0;
    const prixUnitaireBoissons =
      boissonsTarifsPourNbPersonnes.find(
        (tarif) =>
          tarif.gamme === gamme && tarif.fournisseurId === fournisseurId
      )?.prixUnitaire ?? 0;
    //Prix panier
    const panierFruits = snacksFruits.infos.choix.includes("fruits")
      ? prixKgFruits * fruitsKgParSemaine
      : 0;
    const panierSnacks = snacksFruits.infos.choix.includes("snacks")
      ? prixUnitaireSnacks * snacksPortionsParSemaine
      : 0;
    const panierBoissons = snacksFruits.infos.choix.includes("boissons")
      ? prixUnitaireBoissons * boissonsConsosParSemaine
      : 0;
    const totalFruits = Math.round(52 * panierFruits);
    const totalSnacks = Math.round(52 * panierSnacks);
    const totalBoissons = Math.round(52 * panierBoissons);

    const prixPanier = panierFruits + panierSnacks + panierBoissons;

    //Prix livraison / panier
    const fraisLivraisonsDuFournisseur = foodLivraisonTarifs.find(
      ({ fournisseurId }) => fournisseurId === fournisseurId
    );
    const isSameFournisseur = fournisseurId === cafe.infos.fournisseurId;
    const prixUnitaireLivraisonSiCafe =
      fraisLivraisonsDuFournisseur?.prixUnitaireSiCafe ?? 0;
    const prixUnitaireLivraison =
      fraisLivraisonsDuFournisseur?.prixUnitaire ?? 0;

    let fraisLivraisonPanier = isSameFournisseur
      ? prixUnitaireLivraisonSiCafe
      : prixUnitaireLivraison;

    const seuilFranco = fraisLivraisonsDuFournisseur?.seuilFranco ?? 0;

    fraisLivraisonPanier = prixPanier < seuilFranco ? fraisLivraisonPanier : 0;
    const totalLivraison = Math.round(fraisLivraisonPanier * 52);
    const total = Math.round(52 * (prixPanier + fraisLivraisonPanier));
    const panierMin = fraisLivraisonsDuFournisseur?.panierMin ?? 0;

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
        gamme: "essentiel" | "confort" | "excellence";
        fruitsKgParSemaine: number;
        snacksPortionsParSemaine: number;
        boissonsConsosParSemaine: number;
        gFruitsParSemaineParPersonne: number;
        portionsSnacksParSemaineParPersonne: number;
        consosBoissonsParSemaineParPersonne: number;
        prixKgFruits: number;
        prixUnitaireSnacks: number;
        prixUnitaireBoissons: number;
        prixUnitaireLivraisonSiCafe: number;
        prixUnitaireLivraison: number;
        seuilFranco: number;
        fraisLivraisonPanier: number;
        panierMin: number;
        total: number;
        totalFruits: number;
        totalSnacks: number;
        totalBoissons: number;
        totalLivraison: number;
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

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="3">
      <PropositionsTitle
        icon={Cookie}
        icon2={Banana}
        icon3={CupSoda}
        title="Snacks & Fruits"
        description="Fruits locaux, bio, eco-responsables, snacks sains et gourmands, boissons fraiches, chaque semaine faites varier les plaisirs dans un panier qui ravira vos équipes"
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-4">
        <SnacksFruitsUpdateForm
          fruitsQuantites={fruitsQuantites}
          fruitsTarifs={fruitsTarifs}
          snacksQuantites={snacksQuantites}
          snacksTarifs={snacksTarifs}
          boissonsQuantites={boissonsQuantites}
          boissonsTarifs={boissonsTarifs}
          foodLivraisonTarifs={foodLivraisonTarifs}
        />
        <SnacksFruitsPropositions
          formattedPropositions={formattedPropositions}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default SnacksFruits;
