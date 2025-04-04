"use client";
import PropositionsTitleMobile from "@/app/[locale]/devis/PropositionsTitleMobile";
import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import useScrollIntoCafeEspace from "@/hooks/use-scroll-into-cafe-espace";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Coffee, SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
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
  const { client } = useContext(ClientContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const effectif = client.effectif ?? 0;
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
    setTotalCafe({
      totalEspaces: [{ espaceId: 1, total: 0, totalInstallation: 0 }],
    });
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  //Le container exterieur pour faire defiler les machines
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={t("boissons-chaudes")}
          description={t(
            "cafe-expresso-boissons-lactees-ou-chocolatees-choisissez-le-type-de-boissons-et-le-nombre-de-personnes-pour-votre-espace-cafe-forfait-mensuel-tout-compris-machine-cafe-consommables-la-gamme-determine-la-qualite-du-cafe"
          )}
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Coffee}
          title={t("boissons-chaudes")}
          description={t(
            "cafe-expresso-boissons-lactees-ou-chocolatees-choisissez-le-type-de-boissons-et-le-nombre-de-personnes-pour-votre-espace-cafe-forfait-mensuel-tout-compris-machine-cafe-consommables-la-gamme-determine-la-qualite-du-cafe"
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
