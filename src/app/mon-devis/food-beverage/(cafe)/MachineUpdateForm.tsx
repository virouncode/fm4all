"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RATIO_CHOCO, RATIO_LAIT } from "@/constants/constants";
import { locationCafeMachine } from "@/constants/locationsDistribHygiene";
import { typesBoissons, TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { toLimiteBoissonsParJParMachine } from "@/lib/roundLimitBoissonsParJParMachine";
import { CafeMachineType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";

type MachineFormProps = {
  machine: CafeMachineType;
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const MachineUpdateForm = ({
  machine,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  theConsoTarifs,
}: MachineFormProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const router = useRouter();
  const cafeMachinesIds = cafe.machines.map((item) => item.machineId);

  //Je change le type de boissons
  //Si c'est la première machine :
  //Pour la première machine et les autres : Je ne change pas de fournisseur ni de gamme, je mets juste le total à jour

  const handleChangeTypeBoissons = (value: string) => {
    if (cafe.cafeFournisseurId) {
      const cafeQuantite = cafeQuantites.find(
        ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
      );
      const nbMachines = cafeQuantite?.nbMachines ?? 1;
      const nbCafesParAn = cafeQuantite?.nbCafesParAn as number;
      const nbTassesParJParMachine = Math.round(
        (roundEffectif(machine.nbPersonnes) * 2) / nbMachines
      );
      const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
        nbTassesParJParMachine
      );
      const tarifMachine = cafeMachinesTarifs.find(
        (tarif) =>
          tarif.limiteTassesJ === limiteTassesJParMachine &&
          tarif.type === value &&
          tarif[machine.dureeLocation] !== null &&
          tarif.fournisseurId === cafe.cafeFournisseurId
      );
      if (!tarifMachine) {
        //On retire le fournisseur et on retire les choix
        //si c'est la première machine
        if (cafeMachinesIds[0] === machine.machineId) {
          setCafe((prev) => ({
            ...prev,
            cafeFournisseurId: null,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    typeBoissons: value as TypesBoissonsType,
                    gammeSelected: null,
                  }
                : { ...item, gammeSelected: null }
            ),
          }));
          setThe((prev) => ({
            ...prev,
            gammeSelected: null,
          }));
          setTotalCafe((prev) => ({
            ...prev,
            nomFournisseur: null,
            prixCafeMachines: prev.prixCafeMachines.map((item) => ({
              ...item,
              prix: null,
            })),
            prixThe: null,
          }));
          router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`);
        } else {
          setCafe((prev) => ({
            ...prev,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    typeBoissons: value as TypesBoissonsType,
                    gammeSelected: null,
                  }
                : item
            ),
          }));
          setTotalCafe((prev) => ({
            ...prev,
            prixCafeMachines: prev.prixCafeMachines.map((item) =>
              item.machineId === machine.machineId
                ? {
                    ...item,
                    prix: null,
                    marque: "",
                    modele: "",
                    reconditionne: false,
                  }
                : item
            ),
          }));
        }
        return;
      }
      const prixAnnuelParMachine = tarifMachine
        ? (tarifMachine?.[machine.dureeLocation] ?? 0) +
          (tarifMachine?.paMaintenance ?? 0) +
          (tarifMachine?.prixInstallation ?? 0)
        : 0;
      //PA Consommables
      const tarifCafe = cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId &&
          item.gamme === machine.gammeSelected
      );
      const prixAnnuelConsoCafe = (tarifCafe?.prixUnitaire ?? 0) * nbCafesParAn;

      const tarifLait = laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoLait =
        value !== "cafe"
          ? (tarifLait?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_LAIT
          : 0;

      const tarifChoco = chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoChoco =
        value === "chocolat"
          ? (tarifChoco?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_CHOCO
          : 0;
      const nouveauTotal =
        nbMachines * prixAnnuelParMachine +
        prixAnnuelConsoCafe +
        prixAnnuelConsoLait +
        prixAnnuelConsoChoco;
      //Caractéristiques de la machine
      const nouveauModele =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.modele ?? "";
      const nouvelleMarque =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.marque ?? "";
      const nouveauReconditionne = tarifMachine?.reconditionne ?? false;
      //Je mets à jour le type de boissons de ma machine
      setCafe((prev) => ({
        ...prev,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                typeBoissons: value as TypesBoissonsType,
              }
            : item
        ),
      }));
      //Je mets à jour les totaux
      setTotalCafe((prev) => ({
        ...prev,
        prixCafeMachines: prev.prixCafeMachines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                prix: nouveauTotal,
                marque: nouvelleMarque,
                modele: nouveauModele,
                reconditionne: nouveauReconditionne,
              }
            : item
        ),
      }));
      return;
    }
    //Sinon on met juste à jour le type de boissons :
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              typeBoissons: value as TypesBoissonsType,
            }
          : item
      ),
    }));
  };

  const handleChangeEffectif = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value ? parseInt(value) : client.effectif ?? 0;

    if (cafe.cafeFournisseurId) {
      const cafeQuantite = cafeQuantites.find(
        ({ effectif }) => effectif === roundEffectif(newNbPersonnes)
      );
      const nbMachines = cafeQuantite?.nbMachines ?? 1;

      const nbCafesParAn = cafeQuantite?.nbCafesParAn as number;
      const nbTassesParJParMachine = Math.round(
        (roundEffectif(newNbPersonnes) * 2) / nbMachines
      );
      const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
        nbTassesParJParMachine
      );

      const tarifMachine = cafeMachinesTarifs.find(
        (tarif) =>
          tarif.limiteTassesJ === limiteTassesJParMachine &&
          tarif.type === machine.typeBoissons &&
          tarif[machine.dureeLocation] !== null &&
          tarif.fournisseurId === cafe.cafeFournisseurId
      );
      if (!tarifMachine) {
        //On retire le fournisseur et on retire les choix
        //si c'est la première machine
        if (cafeMachinesIds[0] === machine.machineId) {
          setCafe((prev) => ({
            ...prev,
            cafeFournisseurId: null,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    nbPersonnes: newNbPersonnes,
                    gammeSelected: null,
                  }
                : { ...item, gammeSelected: null }
            ),
          }));
          setThe((prev) => ({
            ...prev,
            gammeSelected: null,
          }));
          setTotalCafe((prev) => ({
            ...prev,
            nomFournisseur: null,
            prixCafeMachines: prev.prixCafeMachines.map((item) => ({
              ...item,
              prix: null,
            })),
            prixThe: null,
          }));
          router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`);
        } else {
          setCafe((prev) => ({
            ...prev,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    nbPersonnes: newNbPersonnes,
                    gammeSelected: null,
                  }
                : item
            ),
          }));
          setTotalCafe((prev) => ({
            ...prev,
            prixCafeMachines: prev.prixCafeMachines.map((item) =>
              item.machineId === machine.machineId
                ? {
                    ...item,
                    prix: null,
                    marque: "",
                    modele: "",
                    reconditionne: false,
                  }
                : item
            ),
          }));
        }
        return;
      }
      const prixAnnuelParMachine = tarifMachine
        ? (tarifMachine?.[machine.dureeLocation] ?? 0) +
          (tarifMachine?.paMaintenance ?? 0) +
          (tarifMachine?.prixInstallation ?? 0)
        : 0;
      //PA Consommables
      const tarifCafe = cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId &&
          item.gamme === machine.gammeSelected
      );
      const prixAnnuelConsoCafe = (tarifCafe?.prixUnitaire ?? 0) * nbCafesParAn;

      const tarifLait = laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoLait =
        value !== "cafe"
          ? (tarifLait?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_LAIT
          : 0;

      const tarifChoco = chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoChoco =
        value === "chocolat"
          ? (tarifChoco?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_CHOCO
          : 0;

      const nouveauTotal =
        nbMachines * prixAnnuelParMachine +
        prixAnnuelConsoCafe +
        prixAnnuelConsoLait +
        prixAnnuelConsoChoco;
      //Caractéristiques de la machine
      const nouveauModele =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.modele ?? "";
      const nouvelleMarque =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.marque ?? "";
      const nouveauReconditionne = tarifMachine?.reconditionne ?? false;
      //Je mets à jour le type de boissons de ma machine
      setCafe((prev) => ({
        ...prev,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                nbPersonnes: newNbPersonnes,
              }
            : item
        ),
      }));
      //Je mets à jour les totaux
      setTotalCafe((prev) => ({
        ...prev,
        prixCafeMachines: prev.prixCafeMachines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                prix: nouveauTotal,
                marque: nouvelleMarque,
                modele: nouveauModele,
                reconditionne: nouveauReconditionne,
              }
            : item
        ),
      }));
      return;
    }
    //Sinon on met juste à jour le nombre de personnes :
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              nbPersonnes: newNbPersonnes,
            }
          : item
      ),
    }));
  };

  const handleSelectDureeLocation = (value: string) => {
    if (cafe.cafeFournisseurId) {
      const cafeQuantite = cafeQuantites.find(
        ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
      );
      const nbMachines = cafeQuantite?.nbMachines ?? 1;
      const nbCafesParAn = cafeQuantite?.nbCafesParAn as number;
      const nbTassesParJParMachine = Math.round(
        (roundEffectif(machine.nbPersonnes) * 2) / nbMachines
      );
      const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
        nbTassesParJParMachine
      );

      const tarifMachine = cafeMachinesTarifs.find(
        (tarif) =>
          tarif.limiteTassesJ === limiteTassesJParMachine &&
          tarif.type === machine.typeBoissons &&
          tarif[value as DureeLocationCafeType] !== null &&
          tarif.fournisseurId === cafe.cafeFournisseurId
      );
      if (!tarifMachine) {
        //On retire le fournisseur et on retire les choix
        //si c'est la première machine
        if (cafeMachinesIds[0] === machine.machineId) {
          setCafe((prev) => ({
            ...prev,
            cafeFournisseurId: null,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    dureeLocation: value as DureeLocationCafeType,
                    gammeSelected: null,
                  }
                : { ...item, gammeSelected: null }
            ),
          }));
          setThe((prev) => ({
            ...prev,
            gammeSelected: null,
          }));
          setTotalCafe((prev) => ({
            ...prev,
            nomFournisseur: null,
            prixCafeMachines: prev.prixCafeMachines.map((item) => ({
              ...item,
              prix: null,
            })),
            prixThe: null,
          }));
          router.push(`/mon-devis/food-beverage?effectif=${client.effectif}`);
        } else {
          setCafe((prev) => ({
            ...prev,
            machines: prev.machines.map((item) =>
              item.machineId === machine?.machineId
                ? {
                    ...item,
                    dureeLocation: value as DureeLocationCafeType,
                    gammeSelected: null,
                  }
                : item
            ),
          }));
          setTotalCafe((prev) => ({
            ...prev,
            prixCafeMachines: prev.prixCafeMachines.map((item) =>
              item.machineId === machine.machineId
                ? {
                    ...item,
                    prix: null,
                    marque: "",
                    modele: "",
                    reconditionne: false,
                  }
                : item
            ),
          }));
        }
        return;
      }
      const prixAnnuelParMachine = tarifMachine
        ? (tarifMachine?.[value as DureeLocationCafeType] ?? 0) +
          (tarifMachine?.paMaintenance ?? 0) +
          (tarifMachine?.prixInstallation ?? 0)
        : 0;
      //PA Consommables
      const tarifCafe = cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId &&
          item.gamme === machine.gammeSelected
      );
      const prixAnnuelConsoCafe = (tarifCafe?.prixUnitaire ?? 0) * nbCafesParAn;

      const tarifLait = laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoLait =
        value !== "cafe"
          ? (tarifLait?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_LAIT
          : 0;

      const tarifChoco = chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(machine.nbPersonnes) &&
          item.fournisseurId === cafe.cafeFournisseurId
      );
      const prixAnnuelConsoChoco =
        value === "chocolat"
          ? (tarifChoco?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_CHOCO
          : 0;

      const nouveauTotal =
        nbMachines * prixAnnuelParMachine +
        prixAnnuelConsoCafe +
        prixAnnuelConsoLait +
        prixAnnuelConsoChoco;
      //Caractéristiques de la machine
      const nouveauModele =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.modele ?? "";
      const nouvelleMarque =
        cafeMachines.find(({ id }) => id === tarifMachine?.cafeMachineId)
          ?.marque ?? "";
      const nouveauReconditionne = tarifMachine?.reconditionne ?? false;
      //Je mets à jour le type de boissons de ma machine
      setCafe((prev) => ({
        ...prev,
        machines: prev.machines.map((item) =>
          item.machineId === machine?.machineId
            ? {
                ...item,
                dureeLocation: value as DureeLocationCafeType,
              }
            : item
        ),
      }));
      //Je mets à jour les totaux
      setTotalCafe((prev) => ({
        ...prev,
        prixCafeMachines: prev.prixCafeMachines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                prix: nouveauTotal,
                marque: nouvelleMarque,
                modele: nouveauModele,
                reconditionne: nouveauReconditionne,
              }
            : item
        ),
      }));
      return;
    }
    //Sinon on met juste à jour la durée de location :
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine?.machineId
          ? {
              ...item,
              dureeLocation: value as DureeLocationCafeType,
            }
          : item
      ),
    }));
  };

  return (
    <form className="w-2/3">
      <div className="flex gap-8 items-center mb-6">
        <div>
          <RadioGroup
            onValueChange={handleChangeTypeBoissons}
            value={machine.typeBoissons}
            className="flex gap-4 items-center"
            name="typeBoissons"
          >
            {typesBoissons.map(({ id, description }) => (
              <div key={id} className="flex gap-2 items-center">
                <RadioGroupItem
                  value={id}
                  title={description}
                  id={`${id}_${machine.machineId}`}
                />
                <Label htmlFor={`${id}_${machine.machineId}`}>
                  {description}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            className={`w-full max-w-xs min-w-20 ${
              machine.nbPersonnes === client.effectif ? "text-destructive" : ""
            }`}
            type="number"
            min={1}
            max={300}
            step={1}
            value={machine.nbPersonnes}
            onChange={handleChangeEffectif}
            id={`nbPersonnes_${machine.machineId}`}
          />
          <Label
            htmlFor={`nbPersonnes_${machine.machineId}`}
            className="text-base"
          >
            personnes
          </Label>
        </div>

        <Select
          value={machine.dureeLocation}
          onValueChange={handleSelectDureeLocation}
        >
          <SelectTrigger className={`w-full max-w-xs`}>
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {locationCafeMachine.map((item) => (
              <SelectItem key={`${location}_${item.id}`} value={item.id}>
                {item.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default MachineUpdateForm;
