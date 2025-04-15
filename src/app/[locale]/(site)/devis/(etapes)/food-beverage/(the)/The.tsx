"use client";
import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import ThePropositions from "./ThePropositions";

type TheProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const The = ({ theConsoTarifs }: TheProps) => {
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  const { cafe } = useContext(CafeContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId - 1,
    }));
  };
  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tThe("thes-varies")}
          icon={Leaf}
          description={tThe(
            "parce-que-tout-le-monde-ne-boit-pas-forcement-du-cafe-un-choix-de-thes-presentes-en-boites-et-coffrets-la-gamme-determine-la-qualite-du-the"
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={tThe("thes-varies")}
          icon={Leaf}
          description={tThe(
            "parce-que-tout-le-monde-ne-boit-pas-forcement-du-cafe-un-choix-de-thes-presentes-en-boites-et-coffrets-la-gamme-determine-la-qualite-du-the"
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        {!cafe.infos.fournisseurId ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-center text-fm4alldestructive">
              {tThe(
                "veuillez-dabord-selectionner-une-offre-de-boissons-chaudes"
              )}
            </p>
          </div>
        ) : (
          <ThePropositions theConsoTarifs={theConsoTarifs} />
        )}
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default The;
