"use client";
import { MAX_EFFECTIF } from "@/constants/constants";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { toast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { calcCafeTotaux } from "@/lib/devis/calc-cafe";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites.schema";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs.schema";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs.schema";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites.schema";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs.schema";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites.schema";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs.schema";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
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
  const prospect = useProspectStore((s) => s.prospect);
  const cafe = useCafeStore((s) => s.cafe);
  const { snacksFruits, setSnacksFruits } = useSnacksFruitsStore(
    useShallow((s) => ({
      snacksFruits: s.snacksFruits,
      setSnacksFruits: s.setSnacksFruits,
    })),
  );
  const effectif = prospect.effectif ?? 0;
  const nbPersonnes = snacksFruits.quantites.nbPersonnes ?? effectif;
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const updateSnacksFruits = (newNbPersonnes: number) => {
    if (snacksFruits.infos.gammeSelected && snacksFruits.infos.entrepriseId) {
      const fruitsTarifsPourNbPersonnes = fruitsTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes),
      );
      const snacksTarifsPourNbPersonnes = snacksTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes),
      );
      const boissonsTarifsPourNbPersonnes = boissonsTarifs.filter(
        (item) => item.effectif === roundEffectif(newNbPersonnes),
      );
      const gFruitsParSemaineParPersonne =
        fruitsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.gParSemaineParPersonne ?? null;
      const minKgFruitsParSemaine =
        fruitsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.minKgParSemaine ?? null;
      const portionsSnacksParSemaineParPersonne =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.portionsParSemaineParPersonne ?? null;
      const minPortionsSnacksParSemaine =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.minPortionsParSemaine ?? null;
      const consosBoissonsParSemaineParPersonne =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.consosParSemaineParPersonne ?? null;
      const minConsosBoissonsParSemaine =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected,
        )?.minConsosParSemaine ?? null;

      const fruitsKgParSemaine =
        gFruitsParSemaineParPersonne !== null && minKgFruitsParSemaine !== null
          ? Math.max(
              (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000,
              minKgFruitsParSemaine,
            )
          : null;
      const snacksPortionsParSemaine =
        portionsSnacksParSemaineParPersonne !== null &&
        minPortionsSnacksParSemaine !== null
          ? Math.max(
              portionsSnacksParSemaineParPersonne * newNbPersonnes,
              minPortionsSnacksParSemaine,
            )
          : null;
      const boissonsConsosParSemaine =
        consosBoissonsParSemaineParPersonne !== null &&
        minConsosBoissonsParSemaine !== null
          ? Math.max(
              consosBoissonsParSemaineParPersonne * newNbPersonnes,
              minConsosBoissonsParSemaine,
            )
          : null;
      const isSamePrestataire =
        snacksFruits.infos.entrepriseId === cafe.infos.entrepriseId;

      //Tarifs / portion
      const prixKgFruits =
        fruitsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.entrepriseId === snacksFruits.infos.entrepriseId,
        )?.prixKg ?? null;

      const prixUnitaireSnacks =
        snacksTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.entrepriseId === snacksFruits.infos.entrepriseId,
        )?.prixUnitaire ?? null;
      const prixUnitaireBoissons =
        boissonsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.entrepriseId === snacksFruits.infos.entrepriseId,
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
      //Prix livraison / panier
      const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
        ({ entrepriseId }) =>
          entrepriseId === snacksFruits.infos.entrepriseId,
      );
      const remiseSiCafe = isSamePrestataire
        ? (fraisLivraisonsFournisseur?.remiseSiCafe ?? 0)
        : 0;
      const prixPanier =
        (1 - remiseSiCafe / 100) *
        (panierFruits + panierSnacks + panierBoissons);

      const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
      const totalCafeEspaces = calcCafeTotaux(cafe).totalEspaces;
      const totalCafeAnnuel =
        totalCafeEspaces.length > 0
          ? totalCafeEspaces
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
          "nous-ne-proposons-pas-de-livraisons-pour-plus-de-300-personnes",
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
      return;
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
