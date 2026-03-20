"use client";
import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/constants/constants";
import useScrollIntoCafeEspace from "@/hooks/use-scroll-into-cafe-espace";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs.schema";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine.schema";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs.schema";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs.schema";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs.schema";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs.schema";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs.schema";
import { Coffee, SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import CafeDesktopEspaces from "./(desktop)/CafeDesktopEspaces";
import CafeMobileEspaces from "./(mobile)/CafeMobileEspaces";

type CafeProps = {
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const Cafe = ({
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
}: CafeProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  const prospect = useProspectStore((s) => s.prospect);
  const setFoodBeverage = useFoodBeverageStore((s) => s.setFoodBeverage);
  const { cafe, setCafe } = useCafeStore(
    useShallow((s) => ({
      cafe: s.cafe,
      setCafe: s.setCafe,
    })),
  );
  const devisProgress = useDevisProgressStore((s) => s.devisProgress);
  const effectif = prospect.effectif ?? 0;
  useScrollIntoFood();
  useScrollIntoCafeEspace();

  const handleClickPrevious = () => {};

  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };

  const handleAddEspace = () => {
    setCafe((prev) => ({
      ...prev,
      nbEspaces: 1,
      espaces: [
        {
          infos: {
            espaceId: 1,
            typeBoissons: "cafe",
            typeLait: null,
            typeChocolat: null,
            gammeCafeSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE
                ? MAX_NB_PERSONNES_PAR_ESPACE
                : effectif,
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
        },
      ],
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  //Le container exterieur pour faire defiler les machines
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={t("boissons-chaudes")}
          description={t(
            "cafe-expresso-boissons-lactees-ou-chocolatees-choisissez-le-type-de-boissons-et-le-nombre-de-personnes-pour-votre-espace-cafe-forfait-mensuel-tout-compris-machine-cafe-consommables-la-gamme-determine-la-qualite-du-cafe",
          )}
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Coffee}
          title={t("boissons-chaudes")}
          description={t(
            "cafe-expresso-boissons-lactees-ou-chocolatees-choisissez-le-type-de-boissons-et-le-nombre-de-personnes-pour-votre-espace-cafe-forfait-mensuel-tout-compris-machine-cafe-consommables-la-gamme-determine-la-qualite-du-cafe",
          )}
          handleClickPrevious={handleClickPrevious}
          previousButton={false}
        />
      )}
      <div
        className="w-full flex-1 overflow-hidden transition"
        ref={propositionsRef}
      >
        {isTabletOrMobile ? (
          <CafeMobileEspaces
            cafeMachines={cafeMachines}
            cafeMachinesTarifs={cafeMachinesTarifs}
            cafeConsoTarifs={cafeConsoTarifs}
            laitConsoTarifs={laitConsoTarifs}
            chocolatConsoTarifs={chocolatConsoTarifs}
            theConsoTarifs={theConsoTarifs}
            sucreConsoTarifs={sucreConsoTarifs}
            handleAddEspace={handleAddEspace}
          />
        ) : (
          <CafeDesktopEspaces
            cafeMachines={cafeMachines}
            cafeMachinesTarifs={cafeMachinesTarifs}
            cafeConsoTarifs={cafeConsoTarifs}
            laitConsoTarifs={laitConsoTarifs}
            chocolatConsoTarifs={chocolatConsoTarifs}
            theConsoTarifs={theConsoTarifs}
            sucreConsoTarifs={sucreConsoTarifs}
            handleAddEspace={handleAddEspace}
          />
        )}
      </div>
      {!cafe.nbEspaces && !isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default Cafe;
