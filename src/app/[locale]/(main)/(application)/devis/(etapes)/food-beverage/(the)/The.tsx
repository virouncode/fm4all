"use client";
import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs.schema";
import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import ThePropositions from "./ThePropositions";

type TheProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const The = ({ theConsoTarifs }: TheProps) => {
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  const cafe = useCafeStore((s) => s.cafe);
  const setFoodBeverage = useFoodBeverageStore((s) => s.setFoodBeverage);
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
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tThe("thes-varies")}
          icon={Leaf}
          description={tThe(
            "parce-que-tout-le-monde-ne-boit-pas-forcement-du-cafe-un-choix-de-thes-presentes-en-boites-et-coffrets-la-gamme-determine-la-qualite-du-the",
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={tThe("thes-varies")}
          icon={Leaf}
          description={tThe(
            "parce-que-tout-le-monde-ne-boit-pas-forcement-du-cafe-un-choix-de-thes-presentes-en-boites-et-coffrets-la-gamme-determine-la-qualite-du-the",
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        {!cafe.infos.entrepriseId ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-destructive text-center">
              {tThe(
                "veuillez-dabord-selectionner-une-offre-de-boissons-chaudes",
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
