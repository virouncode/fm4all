import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RATIO_CHOCO, RATIO_LAIT } from "@/constants/constants";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { roundEffectif } from "@/lib/roundEffectif";
import { toLimiteBoissonsParJParMachine } from "@/lib/roundLimitBoissonsParJParMachine";
import { CafeMachineType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { gammes } from "@/zod-schemas/gamme";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import NextServiceButton from "../../mes-services/NextServiceButton";

type MachinePropositionsProps = {
  machineId: number;
  cafeMachines?: SelectCafeMachinesType[];
  cafeQuantites?: SelectCafeQuantitesType[];
  cafeMachinesTarifs?: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs?: SelectCafeConsoTarifsType[];
  laitConsoTarifs?: SelectLaitConsoTarifsType[];
  chocoConsoTarifs?: SelectChocoConsoTarifsType[];
  effectif: string;
  cafeFournisseurId?: string;
};

const MachinePropositions = ({
  machineId,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  effectif,
  cafeFournisseurId,
}: MachinePropositionsProps) => {
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { cafe } = useContext(CafeContext);
  const router = useRouter();
  const machine = cafe.machines.find(
    (item) => item.machineId === machineId
  ) as CafeMachineType;

  const nbMachines = cafeQuantites?.find(
    ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
  )?.nbMachines as number;
  const nbCafesParAn = cafeQuantites?.find(
    ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
  )?.nbCafesParAn as number;
  const nbBoissonsParJParMachine = Math.round(
    (roundEffectif(machine.nbPersonnes) * 2) / nbMachines
  );
  const limiteBoissonsJParMachine = toLimiteBoissonsParJParMachine(
    nbBoissonsParJParMachine
  );
  const tarifsMachines = cafeMachinesTarifs?.filter(
    (tarif) =>
      tarif.limiteTassesJ === limiteBoissonsJParMachine &&
      tarif.type === machine.typeBoissons &&
      tarif[machine.dureeLocation] !== null
  );
  const fournisseursId =
    cafeFournisseurId &&
    cafe.machines.map(({ machineId }) => machineId)[0] !== machineId
      ? [parseInt(cafeFournisseurId)]
      : tarifsMachines?.map(({ fournisseurId }) => fournisseurId);

  const propositions =
    cafeConsoTarifs
      ?.filter(
        (tarif) =>
          tarif.effectif === roundEffectif(machine.nbPersonnes) &&
          fournisseursId?.includes(tarif.fournisseurId)
      )
      .map((tarif) => {
        const tarifCafeConso = tarif.prixUnitaire * nbCafesParAn;
        const tarifLaitConso =
          machine.typeBoissons !== "cafe"
            ? (laitConsoTarifs?.find(
                ({ effectif }) =>
                  effectif === roundEffectif(machine.nbPersonnes)
              )?.prixUnitaire ?? 0) *
              nbCafesParAn *
              RATIO_LAIT
            : 0;
        const tarifChocoConso =
          machine.typeBoissons === "chocolat"
            ? (chocoConsoTarifs?.find(
                ({ effectif }) =>
                  effectif === roundEffectif(machine.nbPersonnes)
              )?.prixUnitaire ?? 0) *
              nbCafesParAn *
              RATIO_CHOCO
            : 0;
        const tarifMachineRecord = tarifsMachines?.find(
          ({ fournisseurId }) => fournisseurId === tarif.fournisseurId
        ) as SelectCafeMachinesTarifsType;

        const modeleMachine = tarifMachineRecord
          ? cafeMachines?.find(
              ({ id }) => id === tarifMachineRecord?.cafeMachineId
            )?.modele ?? null
          : null;
        const marqueMachine = tarifMachineRecord
          ? cafeMachines?.find(
              ({ id }) => id === tarifMachineRecord?.cafeMachineId
            )?.marque ?? null
          : null;
        const reconditionne = tarifMachineRecord
          ? tarifMachineRecord.reconditionne
          : null;
        const prixAnnuel = Math.round(
          tarifCafeConso +
            tarifLaitConso +
            tarifChocoConso +
            nbMachines *
              ((tarifMachineRecord[machine.dureeLocation] as number) +
                (tarifMachineRecord.paMaintenance ?? 0) +
                (tarifMachineRecord.prixInstallation ?? 0))
        );
        return {
          ...tarif,
          prixAnnuel,
          modeleMachine: modeleMachine,
          marqueMachine: marqueMachine,
          reconditionne,
        };
      }) ?? [];

  const propositionsByFournisseurId = propositions
    .filter((proposition) => proposition.prixAnnuel)
    .reduce<
      Record<
        number,
        (SelectCafeConsoTarifsType & {
          prixAnnuel: number | null;
          modeleMachine: string | null;
          marqueMachine: string | null;
          reconditionne: boolean | null;
        })[]
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

  const handleClickProposition = (
    propositionId: number,
    fournisseurId: number,
    nomEntreprise: string,
    prixAnnuel: number | null
  ) => {
    if (machine.propositionId === propositionId) {
      //Si je décoche
      setCafe((prev) => ({
        ...prev,
        cafeFournisseurId: null,
        machines: prev.machines.map((item) =>
          item.machineId === machine.machineId
            ? {
                ...item,
                propositionId: null,
              }
            : item
        ),
      }));
      if (cafe.machines.map(({ machineId }) => machineId)[0] === machineId) {
        //si c'est la première machine
        router.push(`/mon-devis/food-beverage?effectif=${effectif}`);
        setTotalCafe((prev) => ({
          ...prev,
          nomFournisseur: null,
          prixCafeMachines: prev.prixCafeMachines.map((item) =>
            item.machineId === machine.machineId
              ? { ...item, prix: null }
              : item
          ),
          prixThe: null,
        }));
        return;
      } //Si c'est pas la première machine
      setTotalCafe((prev) => ({
        ...prev,
        prixCafeMachines: prev.prixCafeMachines.map((item) =>
          item.machineId === machine.machineId ? { ...item, prix: null } : item
        ),
      }));
      return;
    }
    //Si je coche
    setCafe((prev) => ({
      ...prev,
      cafeFournisseurId: fournisseurId,
      machines: prev.machines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              propositionId,
            }
          : item
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      nomFournisseur: nomEntreprise,
      prixCafeMachines: prev.prixCafeMachines.map((item) =>
        item.machineId === machine.machineId
          ? { ...item, prix: prixAnnuel }
          : item
      ),
    }));
    if (cafe.machines.map(({ machineId }) => machineId)[0] === machineId) {
      //si c'est la première machine
      router.push(
        `/mon-devis/food-beverage?cafeFournisseurId=${fournisseurId}&effectif=${effectif}`
      );
      if (
        cafe.cafeFournisseurId !== fournisseurId &&
        cafe.machines.length > 1
      ) {
        //si je change de fournisseur
        toast({
          title: "Attention",
          description: `Vous avez changé de fournisseur, pensez à refaire vos choix pour les autres machines`,
          variant: "destructive",
          duration: 3000,
        });
      }
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
          validated: true,
          propositionId: null,
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
        },
      ],
    }));
  };
  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };
  const handleClickNextMachine = () => {
    const machinesIds = cafe.machines.map(({ machineId }) => machineId);
    const indexOfCurrentMachine = machinesIds.indexOf(machineId);
    setCafe((prev) => ({
      ...prev,
      currentMachineId: machinesIds[indexOfCurrentMachine + 1],
    }));
  };
  return (
    <div className="flex-1 flex flex-col gap-4">
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
                        machine.propositionId === proposition.id
                          ? "ring-2 ring-inset ring-destructive"
                          : ""
                      }`}
                      key={proposition.id}
                      onClick={() =>
                        handleClickProposition(
                          proposition.id,
                          proposition.fournisseurId,
                          proposition.nomEntreprise,
                          proposition.prixAnnuel
                        )
                      }
                    >
                      <Checkbox
                        checked={machine.propositionId === proposition.id}
                        onCheckedChange={() =>
                          handleClickProposition(
                            proposition.id,
                            proposition.fournisseurId,
                            proposition.nomEntreprise,
                            proposition.prixAnnuel
                          )
                        }
                        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                      />
                      <div>
                        <p className="font-bold">{prixAnnuel}</p>
                        <p className="text-sm">
                          {nbMachines} machine(s){" "}
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

      {cafe.machines.map(({ machineId }) => machineId).slice(-1)[0] ===
      machineId ? (
        <div className="flex justify-end gap-4 items-center">
          {machine.propositionId ? (
            <Button variant="outline" size="lg" onClick={handleAddMachine}>
              Ajouter une machine
            </Button>
          ) : null}
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : (
        <div className="ml-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={handleClickNextMachine}
            className={machine.propositionId ? "" : "invisible"}
          >
            Machine(s) suivante(s) ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default MachinePropositions;
