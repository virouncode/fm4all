import { Button } from "@/components/ui/button";
import { CafeContext } from "@/context/CafeProvider";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useContext } from "react";
import CafeMobileEspace from "./CafeMobileEspace";

type CafeMobileEspacesProps = {
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
  handleAddEspace: () => void;
};

const CafeMobileEspaces = ({
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
  handleAddEspace,
}: CafeMobileEspacesProps) => {
  const { cafe } = useContext(CafeContext);
  return cafe.nbEspaces && cafe.nbEspaces > 0 ? (
    cafe.espaces.map((espace) => (
      <CafeMobileEspace
        key={espace.infos.espaceId}
        espace={espace}
        cafeMachines={cafeMachines}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocolatConsoTarifs={chocolatConsoTarifs}
        theConsoTarifs={theConsoTarifs}
        sucreConsoTarifs={sucreConsoTarifs}
      />
    ))
  ) : (
    <div className="flex justify-center">
      <Button
        variant="outline"
        size="lg"
        className="text-base"
        onClick={handleAddEspace}
      >
        Ajouter un espace café
      </Button>
    </div>
  );
};

export default CafeMobileEspaces;
