"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
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
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { useContext } from "react";
import { MAX_EFFECTIF } from "../../mes-locaux/MesLocaux";

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
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const effectif = client.effectif ?? 0;
  const nbPersonnes = snacksFruits.quantites.nbPersonnes || effectif;

  const handleChangeNbPersonnes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : effectif;
    if (newNbPersonnes > MAX_EFFECTIF) newNbPersonnes = MAX_EFFECTIF;

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
          ? (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000 >=
            minKgFruitsParSemaine
            ? (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000
            : minKgFruitsParSemaine
          : null;
      const snacksPortionsParSemaine =
        portionsSnacksParSemaineParPersonne !== null &&
        minPortionsSnacksParSemaine !== null
          ? portionsSnacksParSemaineParPersonne * newNbPersonnes >=
            minPortionsSnacksParSemaine
            ? portionsSnacksParSemaineParPersonne * newNbPersonnes
            : minPortionsSnacksParSemaine
          : null;
      const boissonsConsosParSemaine =
        consosBoissonsParSemaineParPersonne !== null &&
        minConsosBoissonsParSemaine !== null
          ? consosBoissonsParSemaineParPersonne * newNbPersonnes >=
            minConsosBoissonsParSemaine
            ? consosBoissonsParSemaineParPersonne * newNbPersonnes
            : minConsosBoissonsParSemaine
          : null;
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
      const totalFruits = Math.round(52 * panierFruits);
      const totalSnacks = Math.round(52 * panierSnacks);
      const totalBoissons = Math.round(52 * panierBoissons);

      const prixPanier = panierFruits + panierSnacks + panierBoissons;

      //Prix livraison / panier
      const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
        ({ fournisseurId }) =>
          fournisseurId === snacksFruits.infos.fournisseurId
      );
      const panierMin = fraisLivraisonsFournisseur?.panierMin ?? null;
      const isPanierMin = panierMin === null || prixPanier >= panierMin;

      const isSameFournisseur =
        snacksFruits.infos.fournisseurId === cafe.infos.fournisseurId;
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
        fraisLivraisonPanier !== null
          ? Math.round(fraisLivraisonPanier * 52)
          : null;
      const total =
        fraisLivraisonPanier !== null
          ? Math.round(52 * (prixPanier + fraisLivraisonPanier))
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
      const totalFruits = Math.round(52 * panierFruits);
      const totalSnacks = Math.round(52 * panierSnacks);
      const totalBoissons = Math.round(52 * panierBoissons);

      const prixPanier = panierFruits + panierSnacks + panierBoissons;
      const fraisLivraisonsFournisseur = foodLivraisonTarifs.find(
        (tarif) => tarif.fournisseurId === snacksFruits.infos.fournisseurId
      );
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
        fraisLivraisonPanier !== null
          ? Math.round(fraisLivraisonPanier * 52)
          : null;
      const total =
        fraisLivraisonPanier !== null
          ? Math.round(52 * (prixPanier + fraisLivraisonPanier))
          : null;

      setTotalSnacksFruits((prev) => ({
        ...prev,
        totalFruits,
        totalSnacks,
        totalBoissons,
        totalLivraison,
        total,
      }));
    }
  };
  return (
    <form className="w-2/3 flex items-center gap-8">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("fruits")}
            onCheckedChange={() => handleCheck("fruits")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="fruits"
          />
          <Label htmlFor={`fruits`} className="text-sm">
            Fruits
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("snacks")}
            onCheckedChange={() => handleCheck("snacks")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="snacks"
          />
          <Label htmlFor={`snacks`} className="text-sm">
            Snacks
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("boissons")}
            onCheckedChange={() => handleCheck("boissons")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="boissons"
          />
          <Label htmlFor={`boissons`} className="text-sm">
            Boissons
          </Label>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          className={`w-full max-w-xs min-w-20 ${
            snacksFruits.quantites.nbPersonnes === client.effectif
              ? "text-destructive"
              : ""
          }`}
          type="number"
          min={1}
          max={MAX_EFFECTIF}
          step={1}
          value={nbPersonnes}
          onChange={handleChangeNbPersonnes}
          id={`nbPersonnesFood`}
        />
        <Label htmlFor={`nbPersonnesFood`} className="text-sm">
          personnes
        </Label>
      </div>
    </form>
  );
};

export default SnacksFruitsForm;
