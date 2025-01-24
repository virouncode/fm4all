"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type SnacksFruitsUpdateFormProps = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
};

const SnacksFruitsUpdateForm = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsUpdateFormProps) => {
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { totalSnacksFruits, setTotalSnacksFruits } = useContext(
    TotalSnacksFruitsContext
  );

  const handleChangeNbPersonnes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value ? parseInt(value) : client.effectif ?? 0;

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
        )?.gParSemaineParPersonne ?? 0;
      const minKgFruitsParSemaine =
        fruitsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minKgParSemaine ?? 0;
      const portionsSnacksParSemaineParPersonne =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.portionsParSemaineParPersonne ?? 0;
      const minPortionsSnacksParSemaine =
        snacksQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minPortionsParSemaine ?? 0;
      const consosBoissonsParSemaineParPersonne =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.consosParSemaineParPersonne ?? 0;
      const minConsosBoissonsParSemaine =
        boissonsQuantites.find(
          (quantite) => quantite.gamme === snacksFruits.infos.gammeSelected
        )?.minConsosParSemaine ?? 0;
      const fruitsKgParSemaine =
        (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000 >=
        minKgFruitsParSemaine
          ? (gFruitsParSemaineParPersonne * newNbPersonnes) / 1000
          : minKgFruitsParSemaine;
      const snacksPortionsParSemaine =
        portionsSnacksParSemaineParPersonne * newNbPersonnes >=
        minPortionsSnacksParSemaine
          ? portionsSnacksParSemaineParPersonne * newNbPersonnes
          : minPortionsSnacksParSemaine;
      const boissonsConsosParSemaine =
        consosBoissonsParSemaineParPersonne * newNbPersonnes >=
        minConsosBoissonsParSemaine
          ? consosBoissonsParSemaineParPersonne * newNbPersonnes
          : minConsosBoissonsParSemaine;
      //Tarifs / portion
      const prixKgFruits =
        fruitsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixKg ?? 0;
      const prixUnitaireSnacks =
        snacksTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixUnitaire ?? 0;
      const prixUnitaireBoissons =
        boissonsTarifsPourNbPersonnes.find(
          (tarif) =>
            tarif.gamme === snacksFruits.infos.gammeSelected &&
            tarif.fournisseurId === snacksFruits.infos.fournisseurId
        )?.prixUnitaire ?? 0;
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
        ({ fournisseurId }) =>
          fournisseurId === snacksFruits.infos.fournisseurId
      );
      const isSameFournisseur =
        snacksFruits.infos.fournisseurId === cafe.infos.fournisseurId;
      const prixUnitaireLivraisonSiCafe =
        fraisLivraisonsDuFournisseur?.prixUnitaireSiCafe ?? 0;
      const prixUnitaireLivraison =
        fraisLivraisonsDuFournisseur?.prixUnitaire ?? 0;

      let fraisLivraisonPanier = isSameFournisseur
        ? prixUnitaireLivraisonSiCafe
        : prixUnitaireLivraison;

      const seuilFranco = fraisLivraisonsDuFournisseur?.seuilFranco ?? 0;

      fraisLivraisonPanier =
        prixPanier < seuilFranco ? fraisLivraisonPanier : 0;
      const totalLivraison = Math.round(fraisLivraisonPanier * 52);
      const total = Math.round(52 * (prixPanier + fraisLivraisonPanier));
      const panierMin = fraisLivraisonsDuFournisseur?.panierMin ?? 0;

      setSnacksFruits((prev) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          nbPersonnes: newNbPersonnes,
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

  const handleCheck = (type: "fruits" | "snacks" | "boissons") => {
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
        totalFruits: 0,
        totalSnacks: 0,
        totalBoissons: 0,
        totalLivraison: 0,
        total: 0,
      }));
      return;
    }
    if (snacksFruits.infos.gammeSelected && snacksFruits.infos.fournisseurId) {
      const panierFruits = newChoix.includes("fruits")
        ? (snacksFruits.prix.prixKgFruits ?? 0) *
          snacksFruits.quantites.fruitsKgParSemaine
        : 0;
      const panierSnacks = newChoix.includes("snacks")
        ? (snacksFruits.prix.prixUnitaireSnacks ?? 0) *
          snacksFruits.quantites.snacksPortionsParSemaine
        : 0;
      const panierBoissons = newChoix.includes("boissons")
        ? (snacksFruits.prix.prixUnitaireBoissons ?? 0) *
          snacksFruits.quantites.boissonsConsosParSemaine
        : 0;
      const totalFruits = Math.round(52 * panierFruits);
      const totalSnacks = Math.round(52 * panierSnacks);
      const totalBoissons = Math.round(52 * panierBoissons);

      const prixPanier = panierFruits + panierSnacks + panierBoissons;

      let fraisLivraisonPanier = snacksFruits.infos.isSameFournisseur
        ? snacksFruits.prix.prixUnitaireLivraisonSiCafe ?? 0
        : snacksFruits.prix.prixUnitaireLivraison ?? 0;

      const seuilFranco = snacksFruits.prix.seuilFranco ?? 0;

      fraisLivraisonPanier =
        prixPanier < seuilFranco ? fraisLivraisonPanier : 0;
      const totalLivraison = Math.round(fraisLivraisonPanier * 52);
      const total = Math.round(52 * (prixPanier + fraisLivraisonPanier));

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
          max={300}
          step={1}
          value={snacksFruits.quantites.nbPersonnes.toString()}
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

export default SnacksFruitsUpdateForm;
