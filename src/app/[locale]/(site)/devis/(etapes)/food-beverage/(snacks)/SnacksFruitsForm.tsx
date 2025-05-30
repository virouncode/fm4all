"use client";
import { MAX_EFFECTIF } from "@/constants/constants";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { toast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import SnacksFruitsDesktopInputs from "./(desktop)/SnacksFruitsDesktopInputs";
import SnacksFruitsMobileInputs from "./(mobile)/SnacksFruitsMobileInputs";

type SnacksFruitsFormProps = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
};

const SnacksFruitsForm = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsFormProps) => {
  const t = useTranslations("DevisPage");
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const effectif = client.effectif ?? 0;
  const nbPersonnes = snacksFruits.quantites.nbPersonnes ?? effectif;
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const updateSnacksFruits = (newNbPersonnes: number) => {
    if (snacksFruits.infos.gammeSelected && snacksFruits.infos.fournisseurId) {
      const fruitsTarifsPourNbPersonnes = fruitsTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes)
      );
      const snacksTarifsPourNbPersonnes = snacksTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes)
      );
      const boissonsTarifsPourNbPersonnes = boissonsTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes)
      );
      const gFruitsParSemaineParPersonne =
        fruitsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.gParSemaineParPersonne ?? null;
      const minKgFruitsParSemaine =
        fruitsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minKgParSemaine ?? null;
      const portionsSnacksParSemaineParPersonne =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.portionsParSemaineParPersonne ?? null;
      const minPortionsSnacksParSemaine =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minPortionsParSemaine ?? null;
      const consosBoissonsParSemaineParPersonne =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.consosParSemaineParPersonne ?? null;
      const minConsosBoissonsParSemaine =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minConsosParSemaine ?? null;

      const fruitsKgParSemaine =
        gFruitsParSemaineParPersonne !== null && minKgFruitsParSemaine !== null
          ? Math.max(
              (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000,
              minKgFruitsParSemaine
            )
          : null;
      const snacksPortionsParSemaine =
        portionsSnacksParSemaineParPersonne !== null &&
        minPortionsSnacksParSemaine !== null
          ? Math.max(
              portionsSnacksParSemaineParPersonne * newNbPersonnes,
              minPortionsSnacksParSemaine
            )
          : null;
      const boissonsConsosParSemaine =
        consosBoissonsParSemaineParPersonne !== null &&
        minConsosBoissonsParSemaine !== null
          ? Math.max(
              consosBoissonsParSemaineParPersonne * newNbPersonnes,
              minConsosBoissonsParSemaine
            )
          : null;
      const isSameFournisseur =
        snacksFruits.infos.fournisseurId === cafe.infos.fournisseurId;

      //Tarifs / portion
      const prixKgFruits =
        fruitsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixKg ?? null;

      const prixUnitaireSnacks =
        snacksTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixUnitaire ?? null;
      const prixUnitaireBoissons =
        boissonsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixUnitaire ?? null;
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
        ({ fournisseurId }) =>
          fournisseurId === snacksFruits.infos.fournisseurId
      );
      const remiseSiCafe = isSameFournisseur
        ? (fraisLivraisonsFournisseur?.remiseSiCafe ?? 0)
        : 0;
      const prixPanierSansRemise = panierFruits + panierSnacks + panierBoissons;
      const prixPanier =
        (1 - remiseSiCafe / 100) *
        (panierFruits + panierSnacks + panierBoissons);

      const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
      const isPanierMin =
        panierMin === null ||
        prixPanier +
          totalCafe.totalEspaces
            .map(({ total }) => total ?? 0)
            .reduce((acc, curr) => acc + curr, 0) /
            12 >=
          panierMin;

      const prixUnitaireLivraisonSiCafe = isPanierMin
        ? (fraisLivraisonsFournisseur?.prixUnitaireSiCafe ?? null)
        : null;

      const prixUnitaireLivraison = isPanierMin
        ? (fraisLivraisonsFournisseur?.prixUnitaire ?? null)
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
        fraisLivraisonPanier !== null && newNbPersonnes
          ? 52 * (prixPanier + fraisLivraisonPanier)
          : null;
      const totalSansRemise =
        fraisLivraisonPanier !== null && newNbPersonnes
          ? 52 * (prixPanierSansRemise + fraisLivraisonPanier)
          : null;

      setSnacksFruits((prev) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          nbPersonnes: newNbPersonnes,
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
    } else {
      setSnacksFruits((prev) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          nbPersonnes: newNbPersonnes,
        },
      }));
    }
  };

  const handleChangeNbPersonnes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : 0;
    if (newNbPersonnes > MAX_EFFECTIF) newNbPersonnes = MAX_EFFECTIF;
    updateSnacksFruits(newNbPersonnes);
  };

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes > MAX_EFFECTIF) {
      newNbPersonnes = MAX_EFFECTIF;
      toast({
        title: t("limite-atteinte"),
        description: t(
          "nous-ne-proposons-pas-de-livraisons-pour-plus-de-300-personnes"
        ),
        duration: 7000,
      });
    }
    updateSnacksFruits(newNbPersonnes);
  };

  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes < 0) newNbPersonnes = 0;
    updateSnacksFruits(newNbPersonnes);
  };

  const handleCheck = (type: TypesSnacksFruitsType) => {
    const newChoix = snacksFruits.infos.choix.includes(type)
      ? snacksFruits.infos.choix.filter((item) => item !== type)
      : [...snacksFruits.infos.choix, type];

    setSnacksFruits((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        choix: newChoix,
      },
    }));

    if (newChoix.length === 0) {
      setTotalSnacksFruits((prev) => ({
        ...prev,
        totalFruits: null,
        totalSnacks: null,
        totalBoissons: null,
        totalLivraison: null,
        total: null,
      }));
      return;
    }
    if (snacksFruits.infos.gammeSelected && snacksFruits.infos.fournisseurId) {
      const panierFruits =
        newChoix.includes("fruits") &&
        snacksFruits.quantites.fruitsKgParSemaine !== null
          ? (snacksFruits.prix.prixKgFruits ?? 0) *
            snacksFruits.quantites.fruitsKgParSemaine
          : 0;
      const panierSnacks =
        newChoix.includes("snacks") &&
        snacksFruits.quantites.snacksPortionsParSemaine !== null
          ? (snacksFruits.prix.prixUnitaireSnacks ?? 0) *
            snacksFruits.quantites.snacksPortionsParSemaine
          : 0;
      const panierBoissons =
        newChoix.includes("boissons") &&
        snacksFruits.quantites.boissonsConsosParSemaine !== null
          ? (snacksFruits.prix.prixUnitaireBoissons ?? 0) *
            snacksFruits.quantites.boissonsConsosParSemaine
          : 0;
      const totalFruits = 52 * panierFruits;
      const totalSnacks = 52 * panierSnacks;
      const totalBoissons = 52 * panierBoissons;

      const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
        (tarif) => tarif.fournisseurId === snacksFruits.infos.fournisseurId
      );
      const isSameFournisseur =
        snacksFruits.infos.fournisseurId === cafe.infos.fournisseurId;
      const remiseSiCafe = isSameFournisseur
        ? (fraisLivraisonsFournisseur?.remiseSiCafe ?? 0)
        : 0;
      const prixPanierSansRemise = panierFruits + panierSnacks + panierBoissons;
      const prixPanier =
        (1 - remiseSiCafe / 100) *
        (panierFruits + panierSnacks + panierBoissons);
      const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
      const isPanierMin = panierMin === null || prixPanier >= panierMin;

      let fraisLivraisonPanier = snacksFruits.infos.isSameFournisseur
        ? snacksFruits.prix.prixUnitaireLivraisonSiCafe
        : snacksFruits.prix.prixUnitaireLivraison;

      const seuilFranco = snacksFruits.prix.seuilFranco ?? 0;

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

      setTotalSnacksFruits((prev) => ({
        ...prev,
        totalFruits,
        totalSnacks,
        totalBoissons,
        totalLivraison,
        total,
        totalSansRemise,
      }));
    }
  };
  return isTabletOrMobile ? (
    <SnacksFruitsMobileInputs
      handleCheck={handleCheck}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      nbPersonnes={nbPersonnes}
      handleIncrement={handleIncrement}
      handleDecrement={handleDecrement}
    />
  ) : (
    <SnacksFruitsDesktopInputs
      handleCheck={handleCheck}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      nbPersonnes={nbPersonnes}
    />
  );
};

export default SnacksFruitsForm;
