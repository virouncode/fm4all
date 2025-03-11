import { Button } from "@/components/ui/button";
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
import { RATIO_CHOCO, RATIO_LAIT, RATIO_SUCRE } from "@/constants/constants";
import { locationCafeMachine } from "@/constants/locationCafeMachine";
import { typesBoissons } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { toast } from "@/hooks/use-toast";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { roundNbPersonnesCafeMachines } from "@/lib/roundNbPersonnesCafeMachines";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { Minus, Plus } from "lucide-react";
import React, { useContext } from "react";
import { MAX_EFFECTIF } from "../../../mes-locaux/MesLocaux";
import { MAX_NB_PERSONNES_PAR_ESPACE } from "../CafeEspacePropositions";

type CafeMobileEspaceInputsProps = {
  espace: CafeEspaceType;
  handleChangeTypeBoissons: (value: string) => void;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  cafeEspacesIds: number[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
  cafeMachines: SelectCafeMachinesType[];
};

const CafeMobileEspaceInputs = ({
  espace,
  handleChangeTypeBoissons,
  nbPersonnes,
  handleChangeNbPersonnes,
  handleSelectDureeLocation,
  cafeEspacesIds,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  sucreConsoTarifs,
  cafeMachines,
}: CafeMobileEspaceInputsProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { setThe } = useContext(TheContext);
  const effectif = client.effectif ?? 0;

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE;
      toast({
        title: "Limite atteinte",
        description:
          "Le nombre de personnes par espace café est limité à 150. Choisissez une offre puis ajoutez un espace café si besoin",
        duration: 7000,
      });
    }
    const newNbPersonnesTotal = cafe.espaces.reduce(
      (acc, curr) =>
        acc + curr.infos.espaceId === espace.infos.espaceId
          ? newNbPersonnes
          : curr.quantites.nbPersonnes ||
            (effectif > MAX_NB_PERSONNES_PAR_ESPACE
              ? MAX_NB_PERSONNES_PAR_ESPACE
              : effectif),
      0
    );
    const newNbTassesParAn = newNbPersonnes * 400;
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                quantites: {
                  ...item.quantites,
                  nbPersonnes: newNbPersonnes,
                },
              }
            : item
        ),
      }));
      return;
    }
    //Si j'avais deja un fournisseur
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesCafeMachines(newNbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.fournisseurId === cafe.infos.fournisseurId &&
        tarif[cafe.infos.dureeLocation] !== null
    );

    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            logoUrl: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : {
                  ...item,
                  infos: {
                    ...item.infos,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
          ),
        }));
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: null,
          },
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
        setTotalThe({
          totalService: null,
        });
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setCafe((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) =>
            item.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  total: null,
                  totalInstallation: null,
                }
              : item
          ),
        }));
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
    const prixLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixInstal = machinesTarifFournisseur.fraisInstallation;
    const prixMaintenance = machinesTarifFournisseur.paMaintenance;
    const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === espace.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const consoLaitTarifFournisseur = laitConsoTarifs.find(
      (item) =>
        item.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        item.fournisseurId === cafe.infos.fournisseurId
    );
    const typeLait =
      espace.infos.typeBoissons === "lait"
        ? machinesTarifFournisseur?.typeLait
        : null;
    const prixUnitaireConsoLait =
      typeLait === "dosettes"
        ? consoLaitTarifFournisseur?.prixUnitaireDosette ?? null
        : typeLait === "frais"
        ? consoLaitTarifFournisseur?.prixUnitaireFrais ?? null
        : typeLait === "poudre"
        ? consoLaitTarifFournisseur?.prixUnitairePoudre ?? null
        : null;

    const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const typeChocolat =
      espace.infos.typeBoissons === "chocolat"
        ? machinesTarifFournisseur?.typeChocolat
        : null;
    const prixUnitaireConsoChocolat =
      typeChocolat === "sachets"
        ? consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null
        : typeChocolat === "poudre"
        ? consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null
        : null;

    const consoSucreTarifFournisseur = sucreConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const prixUnitaireConsoSucre =
      consoSucreTarifFournisseur?.prixUnitaire ?? null;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * newNbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * newNbTassesParAn * RATIO_SUCRE +
      (espace.infos.typeBoissons !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * newNbTassesParAn * RATIO_LAIT
        : 0) +
      (espace.infos.typeBoissons === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * newNbTassesParAn * RATIO_CHOCO
        : 0);
    const totalAnnuel =
      newNbPersonnes && totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = machinesTarifFournisseur
      ? cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.modele ?? null
      : null;
    const marque = machinesTarifFournisseur
      ? cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.marque ?? null
      : null;
    const reconditionne = machinesTarifFournisseur
      ? machinesTarifFournisseur.reconditionne ?? null
      : null;

    //Je mets à jour  ma machine
    setCafe((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                marque,
                modele,
                reconditionne,
              },
              quantites: {
                ...item.quantites,
                nbPersonnes: newNbPersonnes,
                nbMachines,
                nbPassagesParAn,
              },
              prix: {
                prixLoc,
                prixInstal,
                prixMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
                prixUnitaireConsoSucre,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation,
              }
            : item
        ),
      }));
    }
  };
  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes < 0) {
      newNbPersonnes = 0;
    }
    const newNbPersonnesTotal = cafe.espaces.reduce(
      (acc, curr) =>
        acc + curr.infos.espaceId === espace.infos.espaceId
          ? newNbPersonnes
          : curr.quantites.nbPersonnes ||
            (effectif > MAX_NB_PERSONNES_PAR_ESPACE
              ? MAX_NB_PERSONNES_PAR_ESPACE
              : effectif),
      0
    );
    const newNbTassesParAn = newNbPersonnes * 400;
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                quantites: {
                  ...item.quantites,
                  nbPersonnes: newNbPersonnes,
                },
              }
            : item
        ),
      }));
      return;
    }
    //Si j'avais deja un fournisseur
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesCafeMachines(newNbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.fournisseurId === cafe.infos.fournisseurId &&
        tarif[cafe.infos.dureeLocation] !== null
    );

    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            logoUrl: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : {
                  ...item,
                  infos: {
                    ...item.infos,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
          ),
        }));
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: null,
          },
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
        setTotalThe({
          totalService: null,
        });
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setCafe((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) =>
            item.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  total: null,
                  totalInstallation: null,
                }
              : item
          ),
        }));
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
    const prixLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixInstal = machinesTarifFournisseur.fraisInstallation;
    const prixMaintenance = machinesTarifFournisseur.paMaintenance;
    const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === espace.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const consoLaitTarifFournisseur = laitConsoTarifs.find(
      (item) =>
        item.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        item.fournisseurId === cafe.infos.fournisseurId
    );
    const typeLait =
      espace.infos.typeBoissons === "lait"
        ? machinesTarifFournisseur?.typeLait
        : null;
    const prixUnitaireConsoLait =
      typeLait === "dosettes"
        ? consoLaitTarifFournisseur?.prixUnitaireDosette ?? null
        : typeLait === "frais"
        ? consoLaitTarifFournisseur?.prixUnitaireFrais ?? null
        : typeLait === "poudre"
        ? consoLaitTarifFournisseur?.prixUnitairePoudre ?? null
        : null;

    const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const typeChocolat =
      espace.infos.typeBoissons === "chocolat"
        ? machinesTarifFournisseur?.typeChocolat
        : null;
    const prixUnitaireConsoChocolat =
      typeChocolat === "sachets"
        ? consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null
        : typeChocolat === "poudre"
        ? consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null
        : null;

    const consoSucreTarifFournisseur = sucreConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnesTotal) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const prixUnitaireConsoSucre =
      consoSucreTarifFournisseur?.prixUnitaire ?? null;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * newNbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * newNbTassesParAn * RATIO_SUCRE +
      (espace.infos.typeBoissons !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * newNbTassesParAn * RATIO_LAIT
        : 0) +
      (espace.infos.typeBoissons === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * newNbTassesParAn * RATIO_CHOCO
        : 0);
    const totalAnnuel =
      newNbPersonnes && totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = machinesTarifFournisseur
      ? cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.modele ?? null
      : null;
    const marque = machinesTarifFournisseur
      ? cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.marque ?? null
      : null;
    const reconditionne = machinesTarifFournisseur
      ? machinesTarifFournisseur.reconditionne ?? null
      : null;

    //Je mets à jour  ma machine
    setCafe((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                marque,
                modele,
                reconditionne,
              },
              quantites: {
                ...item.quantites,
                nbPersonnes: newNbPersonnes,
                nbMachines,
                nbPassagesParAn,
              },
              prix: {
                prixLoc,
                prixInstal,
                prixMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
                prixUnitaireConsoSucre,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation,
              }
            : item
        ),
      }));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          Indiquez la <strong>durée d&apos;engagement</strong> souhaitée :{" "}
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Durée de location
          </Label>
          {espace.infos.espaceId === cafeEspacesIds[0] && (
            <Select
              value={cafe.infos.dureeLocation}
              onValueChange={handleSelectDureeLocation}
              aria-label="Sélectionnez la durée de location"
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
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le <strong>type de boissons</strong> :{" "}
        </p>
        <RadioGroup
          onValueChange={handleChangeTypeBoissons}
          value={espace.infos.typeBoissons}
          className="flex flex-col gap-4"
          name="typeBoissons"
        >
          {typesBoissons.map(({ id, description }) => (
            <div key={id} className="flex gap-2 items-center">
              <RadioGroupItem
                value={id}
                title={description}
                id={`${id}_${espace.infos.espaceId}`}
              />
              <Label htmlFor={`${id}_${espace.infos.espaceId}`}>
                {description}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le <strong>nombre de personnes</strong> pour l&apos;espace
          café :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Nombre de personnes
          </Label>
          <div className="flex items-center gap-2">
            <Input
              className={`w-16 max-w-xs min-w-20 ${
                nbPersonnes === client.effectif ? "text-fm4alldestructive" : ""
              }`}
              type="number"
              min={1}
              max={MAX_EFFECTIF}
              step={1}
              value={nbPersonnes || ""}
              onChange={handleChangeNbPersonnes}
              id={`nbPersonnes_${espace.infos.espaceId}`}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de personnes"
              onClick={handleDecrement}
              disabled={nbPersonnes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={handleIncrement}
              disabled={nbPersonnes === MAX_EFFECTIF}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeMobileEspaceInputs;
