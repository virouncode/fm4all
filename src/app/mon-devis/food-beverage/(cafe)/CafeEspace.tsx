import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { toast } from "@/hooks/use-toast";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useContext } from "react";
import CafeEspaceForm from "./CafeEspaceForm";
import CafeEspacePropositions from "./CafeEspacePropositions";
import PreviousEspaceButton from "./PreviousEspaceButton";
import { reinitialisationCafeThe } from "./reinitialisationCafeThe";
import RetirerEspaceButton from "./RetirerEspaceButton";

type CafeMachineProps = {
  espace: CafeEspaceType;
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const CafeEspace = ({
  espace,
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
}: CafeMachineProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const cafeEspacesIds = cafe.espaces.map((espace) => espace.infos.espaceId);

  const handleClickPreviousEspace = () => {
    const currentEspaceIdIndex = cafeEspacesIds.indexOf(espace.infos.espaceId);
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: prev.espaces[currentEspaceIdIndex - 1].infos.espaceId,
      },
    }));
  };

  const handleClickRemove = () => {
    if (cafeEspacesIds[0] === espace.infos.espaceId) {
      //Je reinitialise tout
      reinitialisationCafeThe(
        setCafe,
        setThe,
        setTotalCafe,
        setTotalThe,
        client
      );
      return;
    }
    const indexOfCurrentEspace = cafeEspacesIds.indexOf(espace.infos.espaceId);
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: cafeEspacesIds[indexOfCurrentEspace - 1],
      },
      espaces: prev.espaces.filter(
        (item) => item.infos.espaceId !== espace.infos.espaceId
      ),
    }));
    setTotalCafe((prev) => ({
      totalEspaces: prev.totalEspaces.filter(
        (item) => item.espaceId !== espace.infos.espaceId
      ),
    }));
  };

  const handleAlert = () => {
    if (cafeEspacesIds.slice(-1)[0] !== espace.infos.espaceId) {
      toast({
        description: "Veuillez d'abord retirer les espaces suivants",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      id={`espace_${espace.infos.espaceId}`}
    >
      {/* <CafeEspaceSummary espace={espace} /> */}
      <div className="w-full flex justify-between items-start py-1">
        <CafeEspaceForm
          espace={espace}
          cafeMachines={cafeMachines}
          cafeMachinesTarifs={cafeMachinesTarifs}
          cafeConsoTarifs={cafeConsoTarifs}
          laitConsoTarifs={laitConsoTarifs}
          chocolatConsoTarifs={chocolatConsoTarifs}
          sucreConsoTarifs={sucreConsoTarifs}
        />
        <div className="flex gap-2 items-center">
          {cafeEspacesIds[0] !== espace.infos.espaceId && (
            <PreviousEspaceButton
              handleClickPreviousEspace={handleClickPreviousEspace}
            />
          )}
          <div onClick={handleAlert}>
            <RetirerEspaceButton
              handleClickRemove={handleClickRemove}
              disabled={
                cafeEspacesIds[0] !== espace.infos.espaceId &&
                cafeEspacesIds.slice(-1)[0] !== espace.infos.espaceId
              }
              all={cafeEspacesIds[0] === espace.infos.espaceId}
              espaceId={espace.infos.espaceId}
            />
          </div>
        </div>
      </div>
      <CafeEspacePropositions
        cafeMachines={cafeMachines}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocolatConsoTarifs={chocolatConsoTarifs}
        theConsoTarifs={theConsoTarifs}
        sucreConsoTarifs={sucreConsoTarifs}
        espace={espace}
      />
    </div>
  );
};

export default CafeEspace;
