import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { CafeMachineType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import NextServiceButton from "../../mes-services/NextServiceButton";

type MachinePropositionsProps = {
  effectif: string;
  formattedPropositions: (SelectCafeConsoTarifsType & {
    prixAnnuel: number | null;
    modeleMachine: string | null;
    marqueMachine: string | null;
    reconditionne: boolean | null;
  })[][];
  machine: CafeMachineType;
};

const MachinePropositions = ({
  effectif,
  formattedPropositions,
  machine,
}: MachinePropositionsProps) => {
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const router = useRouter();
  const cafeMachinesIds = cafe.machines.map((item) => item.machineId);

  const handleClickProposition = (
    fournisseurId: number,
    gamme: GammeType,
    nomEntreprise: string,
    prixAnnuel: number | null,
    marque: string,
    modele: string,
    reconditionne: boolean
  ) => {
    //Si c'est la première machine
    if (cafeMachinesIds[0] === machine.machineId) {
      //Je decoche
      if (
        machine.gammeSelected === gamme &&
        cafe.cafeFournisseurId === fournisseurId
      ) {
        //Je retire toutes les propositions cafe et the mais je garde les machines
        setCafe((prev) => ({
          ...prev,
          cafeFournisseurId: null,
          machines: prev.machines.map((item) => ({
            ...item,
            gammeSelected: null,
          })),
        }));
        setThe((prev) => ({
          ...prev,
          gammeSelected: null,
        }));
        //Je retire tous les totaux mais je garde les machines
        setTotalCafe((prev) => ({
          ...prev,
          nomFournisseur: null,
          prixCafeMachines: prev.prixCafeMachines.map((item) => ({
            ...item,
            prix: null,
            marque: "",
            modele: "",
            reconditionne: false,
          })),
          prixThe: null,
        }));
        router.push(`/mon-devis/food-beverage?effectif=${effectif}`);
      }
      //Je coche
      else {
        //Je mets à jour le fournisseur et la proposition
        setCafe((prev) => ({
          ...prev,
          cafeFournisseurId: fournisseurId,
          machines:
            fournisseurId === prev.cafeFournisseurId //même fournisseur que le choix précédent
              ? prev.machines.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...item,
                        gammeSelected: gamme,
                      }
                    : item
                )
              : prev.machines.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...item,
                        gammeSelected: gamme,
                      }
                    : { ...item, gammeSelected: null }
                ),
        }));

        //Je mets à jour les totaux
        setTotalCafe((prev) => ({
          ...prev,
          nomFournisseur: nomEntreprise,
          prixCafeMachines:
            fournisseurId === cafe.cafeFournisseurId
              ? prev.prixCafeMachines.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...item,
                        prix: prixAnnuel,
                        marque,
                        modele,
                        reconditionne,
                        nbMachines: machine.nbMachines,
                      }
                    : item
                )
              : prev.prixCafeMachines.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...item,
                        prix: prixAnnuel,
                        marque,
                        modele,
                        reconditionne,
                        nbMachines: machine.nbMachines,
                      }
                    : {
                        ...item,
                        prix: null,
                        marque: "",
                        modele: "",
                        reconditionne: false,
                      }
                ),
          prixThe:
            cafe.cafeFournisseurId !== fournisseurId ? null : prev.prixThe,
        }));
        if (
          cafe.cafeFournisseurId !== fournisseurId &&
          (the.gammeSelected || cafe.machines.length > 1)
        ) {
          setThe((prev) => ({
            ...prev,
            gammeSelected: null,
          }));
          toast({
            title: "Attention",
            description:
              "Vous avez selectionné un nouveau fournisseur, pensez à refaire vos choix pour les autres machines et pour le thé si vous en avez",
            variant: "destructive",
            duration: 3000,
            className: "left-0",
          });
        }
        router.push(
          `/mon-devis/food-beverage?effectif=${effectif}&cafeFournisseurId=${fournisseurId}`
        );
      }
      return;
    }
    //Si ce n'est pas la première machine
    if (machine.gammeSelected === gamme) {
      //Je decoche
      //Je mets à jour la proposition
      setCafe((prev) => ({
        ...prev,
        machines: prev.machines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                gammeSelected: null,
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
                prix: null,
                marque: "",
                modele: "",
                reconditionne: false,
              }
            : item
        ),
      }));
    } else {
      //Je coche
      //Je mets à jour la proposition
      setCafe((prev) => ({
        ...prev,
        machines: prev.machines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                gammeSelected: gamme,
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
                prix: prixAnnuel,
                marque,
                modele,
                reconditionne,
                nbMachines: machine.nbMachines,
              }
            : item
        ),
      }));
    }
  };

  const handleAddMachine = () => {
    setCafe((prev) => ({
      ...prev,
      currentMachineId: prev.machines[prev.machines.length - 1].machineId + 1,
      machines: [
        ...prev.machines,
        {
          machineId: prev.machines[prev.machines.length - 1].machineId + 1,
          typeBoissons: "cafe" as TypesBoissonsType,
          dureeLocation: "pa12M" as DureeLocationCafeType,
          nbPersonnes: parseInt(effectif),
          nbMachines: 0,
          gammeSelected: null,
        },
      ].sort((a, b) => a.machineId - b.machineId),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: [
        ...prev.prixCafeMachines,
        {
          machineId:
            prev.prixCafeMachines[prev.prixCafeMachines.length - 1].machineId +
            1,
          prix: null,
          nbMachines: 0,
          marque: "",
          modele: "",
          reconditionnne: false,
        },
      ],
    }));
  };
  const handleClickNext = () => {
    if (!cafe.cafeFournisseurId) {
      //pour skiper le the si pas de cafe
      setFoodBeverage((prev) => ({
        ...prev,
        currentFoodBeverageId: prev.currentFoodBeverageId + 2,
      }));
      return;
    }
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };
  const handleClickNextMachine = () => {
    const machinesIds = cafeMachinesIds;
    const indexOfCurrentMachine = machinesIds.indexOf(machine.machineId);
    setCafe((prev) => ({
      ...prev,
      currentMachineId: machinesIds[indexOfCurrentMachine + 1],
    }));
  };

  const handleAlert = () => {
    if (!machine.gammeSelected) {
      toast({
        description: "Veuillez d'abord sélectionner une offre",
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  if (formattedPropositions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border rounded-xl">
        <p className="max-w-prose text-center text-base">
          Le fournisseur choisi précédemment ne propose pas d&apos;offre pour
          ces critères, veuillez changer le type de machine, le nombre de
          personnes ou la duree de location
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {isNaN(machine.nbPersonnes) ||
      machine.nbPersonnes < 1 ||
      machine.nbPersonnes > 300 ? (
        <div className="flex-1 flex justify-center items-center">
          <p className="text-center text-xl">
            Veuillez renseigner un nombre de personnes compris entre 1 et 300
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">
          {formattedPropositions.length > 0
            ? formattedPropositions.map((propositions) => (
                <div
                  className="flex border-b flex-1"
                  key={propositions[0].fournisseurId}
                >
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex w-1/4 items-center justify-center p-4">
                          {getLogoFournisseurUrl(
                            propositions[0].fournisseurId
                          ) ? (
                            <div className="w-full h-full relative">
                              <Image
                                src={
                                  getLogoFournisseurUrl(
                                    propositions[0].fournisseurId
                                  ) as string
                                }
                                alt={`logo-de-${propositions[0].nomEntreprise}`}
                                fill={true}
                                className="w-full h-full object-contain"
                                quality={100}
                              />
                            </div>
                          ) : (
                            propositions[0].nomEntreprise
                          )}
                        </div>
                      </TooltipTrigger>
                      {propositions[0].slogan && (
                        <TooltipContent>
                          <p className="text-sm italic">
                            {propositions[0].slogan}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  {propositions.map((proposition) => {
                    const gamme = proposition.gamme;
                    const color =
                      gamme === "essentiel"
                        ? "fm4allessential"
                        : gamme === "confort"
                        ? "fm4allcomfort"
                        : "fm4allexcellence";
                    const prixAnnuel = proposition.prixAnnuel
                      ? `${formatNumber(proposition.prixAnnuel)} € /an`
                      : "Non proposé";
                    return (
                      <div
                        className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer px-10 ${
                          machine.gammeSelected === gamme &&
                          cafe.cafeFournisseurId === proposition.fournisseurId
                            ? "ring-4 ring-inset ring-destructive"
                            : ""
                        }`}
                        key={proposition.id}
                        onClick={() =>
                          handleClickProposition(
                            proposition.fournisseurId,
                            gamme,
                            proposition.nomEntreprise,
                            proposition.prixAnnuel,
                            proposition.marqueMachine ?? "",
                            proposition.modeleMachine ?? "",
                            proposition.reconditionne ?? false
                          )
                        }
                      >
                        <Checkbox
                          checked={
                            machine.gammeSelected === gamme &&
                            cafe.cafeFournisseurId === proposition.fournisseurId
                          }
                          onCheckedChange={() =>
                            handleClickProposition(
                              proposition.fournisseurId,
                              gamme,
                              proposition.nomEntreprise,
                              proposition.prixAnnuel,
                              proposition.marqueMachine ?? "",
                              proposition.modeleMachine ?? "",
                              proposition.reconditionne ?? false
                            )
                          }
                          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                        />
                        <div>
                          <p className="font-bold">{prixAnnuel}</p>
                          <p className="text-sm">
                            {machine.nbMachines} machine(s){" "}
                            {proposition.marqueMachine ?? ""}{" "}
                            {proposition.modeleMachine}
                            {proposition.reconditionne
                              ? " reconditionnée(s)"
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            : null}
        </div>
      )}
      {cafeMachinesIds.slice(-1)[0] === machine.machineId ? (
        <div className="flex justify-end gap-4 items-center">
          {machine.gammeSelected ? (
            <Button variant="outline" size="lg" onClick={handleAddMachine}>
              Ajouter une/des machine(s)
            </Button>
          ) : null}
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : (
        <div className="ml-auto" onClick={handleAlert}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClickNextMachine}
            disabled={!machine.gammeSelected}
          >
            Machine(s) suivante(s) ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default MachinePropositions;
