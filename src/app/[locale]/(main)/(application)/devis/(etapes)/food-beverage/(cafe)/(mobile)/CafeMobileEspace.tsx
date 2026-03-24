import { toast } from "sonner";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs.schema";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine.schema";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs.schema";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs.schema";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs.schema";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs.schema";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs.schema";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";
import CafeEspaceForm from "../CafeEspaceForm";
import CafeEspacePropositions from "../CafeEspacePropositions";
import { reinitialisationCafeThe } from "../reinitialisationCafeThe";
import RetirerEspaceButton from "../RetirerEspaceButton";

type CafeMobileEspaceProps = {
  espace: CafeEspaceType;
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const CafeMobileEspace = ({
  espace,
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
}: CafeMobileEspaceProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  const prospect = useProspectStore((s) => s.prospect);
  const { cafe, setCafe } = useCafeStore(
    useShallow((s) => ({
      cafe: s.cafe,
      setCafe: s.setCafe,
    })),
  );
  const cafeEspacesIds = cafe.espaces.map((espace) => espace.infos.espaceId);

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
  };

  const handleAlert = () => {
    if (
      cafeEspacesIds.slice(-1)[0] !== espace.infos.espaceId &&
      cafeEspacesIds[0] !== espace.infos.espaceId
    ) {
      toast.error(t("veuillez-dabord-retirer-les-espaces-suivants"), {
        duration: 3000,
      });
    }
  };
  return (
    <div
      className="mt-10 flex h-full flex-col gap-4 overflow-hidden"
      id={`espace_${espace.infos.espaceId}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">
          {t("espace-cafe-n")}
          {espace.infos.espaceId}
        </p>
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
      <CafeEspaceForm
        espace={espace}
        cafeMachines={cafeMachines}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocolatConsoTarifs={chocolatConsoTarifs}
        sucreConsoTarifs={sucreConsoTarifs}
      />
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

export default CafeMobileEspace;
