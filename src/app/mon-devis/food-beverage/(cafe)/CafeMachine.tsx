import { CafeMachineType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import MachinePropositions from "./MachinePropositions";
import MachineUpdateForm from "./MachineUpdateForm";

type CafeMachineProps = {
  machine: CafeMachineType;
  cafeMachines?: SelectCafeMachinesType[];
  cafeQuantites?: SelectCafeQuantitesType[];
  cafeMachinesTarifs?: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs?: SelectCafeConsoTarifsType[];
  laitConsoTarifs?: SelectLaitConsoTarifsType[];
  chocoConsoTarifs?: SelectChocoConsoTarifsType[];
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
  return (
    <div id={`machine_${machine.machineId}`} className="h-full flex flex-col">
      <MachineUpdateForm machineId={machine.machineId} />
      <MachinePropositions
        machineId={machine.machineId}
        cafeMachines={cafeMachines}
        cafeQuantites={cafeQuantites}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocoConsoTarifs={chocoConsoTarifs}
        effectif={effectif}
        cafeFournisseurId={cafeFournisseurId}
      />
    </div>
  );
};

export default CafeMachine;
