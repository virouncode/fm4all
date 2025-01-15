import { Button } from "@/components/ui/button";
import { RATIO_CHOCO, RATIO_LAIT } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { toast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/roundEffectif";
import { toLimiteBoissonsParJParMachine } from "@/lib/roundLimitBoissonsParJParMachine";
import { CafeMachineType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { gammes } from "@/zod-schemas/gamme";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { Trash2 } from "lucide-react";
import { useContext, useEffect } from "react";
import MachinePropositions from "./MachinePropositions";
import MachineUpdateForm from "./MachineUpdateForm";

type CafeMachineProps = {
  machine: CafeMachineType;
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  effectif: string;
  cafeFournisseurId?: string;
};

const CafeMachine = ({
  machine,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  effectif,
  cafeFournisseurId,
}: CafeMachineProps) => {
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const cafeMachinesIds = cafe.machines.map(({ machineId }) => machineId);

  useEffect(() => {
    const cafeQuantite = cafeQuantites.find(
      ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
    );
    const nbMachines = cafeQuantite?.nbMachines as number;
    setCafe((prev) => ({
      ...prev,
      machines: prev.machines.map((item) =>
        item.machineId === machine.machineId
          ? {
              ...item,
              nbMachines: nbMachines,
            }
          : item
      ),
    }));
  }, [cafeQuantites, machine.machineId, machine.nbPersonnes, setCafe]);

  const handleClikPreviousMachine = () => {
    setCafe((prev) => ({
      ...prev,
      currentMachineId:
        prev.machines[
          prev.machines.findIndex(
            (item) => item.machineId === machine.machineId
          ) - 1
        ].machineId,
    }));
  };

  const handleClickRemove = () => {
    if (cafeMachinesIds.length === 1) {
      //Je retire la première machine
      setCafe((prev) => ({
        ...prev,
        currentMachineId: null,
        machines: [],
      }));
      setTotalCafe((prev) => ({
        ...prev,
        prixCafeMachines: [],
        prixThe: null,
      }));
      return;
    }
    const indexOfCurrentMachine = cafeMachinesIds.indexOf(machine.machineId);
    setCafe((prev) => ({
      ...prev,
      currentMachineId: cafeMachinesIds[indexOfCurrentMachine - 1],
      machines: prev.machines.filter(
        (item) => item.machineId !== machine.machineId
      ),
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: prev.prixCafeMachines.filter(
        (item) => item.machineId !== machine.machineId
      ),
    }));
  };

  const handleAlert = () => {
    if (cafeMachinesIds.slice(-1)[0] !== machine.machineId) {
      toast({
        description: "Veuillez d'abord retirer les machines suivantes",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const cafeQuantite = cafeQuantites.find(
    ({ effectif }) => effectif === roundEffectif(machine.nbPersonnes)
  );
  //Je trouve la limite de tasses par j / machine
  const nbMachines = cafeQuantite?.nbMachines as number;
  const nbCafesParAn = cafeQuantite?.nbCafesParAn as number;
  const nbTassesParJParMachine = Math.round(
    (roundEffectif(machine.nbPersonnes) * 2) / nbMachines
  );
  const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
    nbTassesParJParMachine
  );
  //J'en déduis les tarifs machines compatibles avec la durée de location et le type de boissons (1 machine par fournisseur)
  const tarifsMachines = cafeMachinesTarifs.filter(
    (tarif) =>
      tarif.limiteTassesJ === limiteTassesJParMachine &&
      tarif.type === machine.typeBoissons &&
      tarif[machine.dureeLocation] !== null
  );
  //Si j'ai déjà choisi un fournisseur et que je ne suis pas sur la première machine, je n'affiche que ses tarifs, sinon j'affiche tous les fournisseurs compatibles
  const fournisseursId =
    cafeFournisseurId && cafeMachinesIds[0] !== machine.machineId
      ? [parseInt(cafeFournisseurId)]
      : tarifsMachines?.map(({ fournisseurId }) => fournisseurId);

  //J'itère sur les tarifs des consommables en café pour créer mes trois gammes pour chaque fournisseur qui a une machine compatible
  const propositions =
    cafeConsoTarifs //J'enlève les tarifs qui ne correspondent pas à l'effectif et les fournisseurs qui n'ont pas de machine compatible
      .filter(
        (tarif) =>
          tarif.effectif === roundEffectif(machine.nbPersonnes) &&
          fournisseursId?.includes(tarif.fournisseurId)
      )
      .map((tarif) => {
        //consommables café
        const prixAnnuelCafeConso = tarif.prixUnitaire * nbCafesParAn;
        //consommables lait
        const laitConsoTarif = laitConsoTarifs?.find(
          (item) =>
            item.effectif === roundEffectif(machine.nbPersonnes) &&
            item.fournisseurId === tarif.fournisseurId
        );
        const prixAnnuelLaitConso =
          machine.typeBoissons !== "cafe"
            ? (laitConsoTarif?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_LAIT
            : 0;
        //consommables chocolat
        const chocoConsoTarif = chocoConsoTarifs?.find(
          (item) =>
            item.effectif === roundEffectif(machine.nbPersonnes) &&
            item.fournisseurId === tarif.fournisseurId
        );
        const prixAnnuelChocoConso =
          machine.typeBoissons === "chocolat"
            ? (chocoConsoTarif?.prixUnitaire ?? 0) * nbCafesParAn * RATIO_CHOCO
            : 0;
        //Infos sur la machine
        const machineTarif = tarifsMachines?.find(
          ({ fournisseurId }) => fournisseurId === tarif.fournisseurId
        );

        const prixAnnuelMachine = machineTarif?.[
          machine.dureeLocation
        ] as number;
        const prixAnnuelMaintenance = machineTarif?.paMaintenance ?? 0;
        const prixAnnuelInstallation = machineTarif?.prixInstallation ?? 0;
        const prixAnnuelTotalParMachine =
          prixAnnuelMachine + prixAnnuelMaintenance + prixAnnuelInstallation;

        const modeleMachine = machineTarif
          ? cafeMachines?.find(({ id }) => id === machineTarif?.cafeMachineId)
              ?.modele ?? null
          : null;
        const marqueMachine = machineTarif
          ? cafeMachines?.find(({ id }) => id === machineTarif?.cafeMachineId)
              ?.marque ?? null
          : null;
        const reconditionne = machineTarif ? machineTarif.reconditionne : null;
        //Prix annuel total
        const prixAnnuel = Math.round(
          prixAnnuelCafeConso +
            prixAnnuelLaitConso +
            prixAnnuelChocoConso +
            nbMachines * prixAnnuelTotalParMachine
        );
        return {
          ...tarif, //l'id du tarif est utilisé pour identifier la proposition (si la proposition change et donc l'id selectionné change car l'effectif change, ce n'est pas grave car de toute facon on annule le choix)
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

  return (
    <div className="h-full flex flex-col" id={`machine_${machine.machineId}`}>
      <div className="w-full flex justify-between items-start">
        <MachineUpdateForm machine={machine} />
        <div className="flex gap-2 items-center">
          {cafeMachinesIds[0] !== machine.machineId && (
            <Button
              variant="outline"
              size="sm"
              title="Machine précédente"
              type="button"
              onClick={handleClikPreviousMachine}
            >
              Machine(s) précédente(s) ↑
            </Button>
          )}
          <div onClick={handleAlert}>
            <Button
              variant="destructive"
              size="sm"
              title="Retirer"
              onClick={handleClickRemove}
              type="button"
              disabled={cafeMachinesIds.slice(-1)[0] !== machine.machineId}
            >
              <Trash2 />
              Retirer machine(s) n°{machine.machineId}
            </Button>
          </div>
        </div>
      </div>
      <MachinePropositions
        effectif={effectif}
        formattedPropositions={formattedPropositions}
        machine={machine}
      />
    </div>
  );
};

export default CafeMachine;
