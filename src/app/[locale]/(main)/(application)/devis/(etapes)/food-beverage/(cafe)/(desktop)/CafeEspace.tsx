import { toast } from "@/hooks/use-toast";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTheStore } from "@/stores/devis/theStore";
import { useTotalCafeStore } from "@/stores/devis/totalCafeStore";
import { useTotalTheStore } from "@/stores/devis/totalTheStore";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";
import CafeEspaceForm from "../CafeEspaceForm";
import CafeEspacePropositions from "../CafeEspacePropositions";
import PreviousEspaceButton from "../PreviousEspaceButton";
import { reinitialisationCafeThe } from "../reinitialisationCafeThe";
import RetirerEspaceButton from "../RetirerEspaceButton";

type CafeEspaceProps = {
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
}: CafeEspaceProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  const prospect = useProspectStore((s) => s.prospect);
  const { cafe, setCafe } = useCafeStore(
    useShallow((s) => ({
      cafe: s.cafe,
      setCafe: s.setCafe,
    })),
  );
  const setThe = useTheStore((s) => s.setThe);
  const setTotalCafe = useTotalCafeStore((s) => s.setTotalCafe);
  const setTotalThe = useTotalTheStore((s) => s.setTotalThe);
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
      reinitialisationCafeThe();
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
        (item) => item.infos.espaceId !== espace.infos.espaceId,
      ),
    }));
    setTotalCafe((prev) => ({
      totalEspaces: prev.totalEspaces.filter(
        (item) => item.espaceId !== espace.infos.espaceId,
      ),
    }));
  };

  const handleAlert = () => {
    if (
      cafeEspacesIds.slice(-1)[0] !== espace.infos.espaceId &&
      cafeEspacesIds[0] !== espace.infos.espaceId
    ) {
      toast({
        description: t("veuillez-dabord-retirer-les-espaces-suivants"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      id={`espace_${espace.infos.espaceId}`}
    >
      {/* <CafeEspaceSummary espace={espace} /> */}
      <div className="flex w-full items-start justify-between overflow-hidden py-1">
        <CafeEspaceForm
          espace={espace}
          cafeMachines={cafeMachines}
          cafeMachinesTarifs={cafeMachinesTarifs}
          cafeConsoTarifs={cafeConsoTarifs}
          laitConsoTarifs={laitConsoTarifs}
          chocolatConsoTarifs={chocolatConsoTarifs}
          sucreConsoTarifs={sucreConsoTarifs}
        />
        <div className="flex items-center gap-2">
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
