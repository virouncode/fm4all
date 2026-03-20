"use client";
import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import useScrollIntoFontainesEspace from "@/hooks/use-scroll-into-fontaines-espace";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTotalFontainesStore } from "@/stores/devis/totalFontainesStore";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles.schema";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs.schema";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsTitle from "../../../PropositionsTitle";
import FontainesDesktopEspaces from "./(desktop)/FontainesDesktopEspaces";
import FontainesMobileEspaces from "./(mobile)/FontainesMobileEspaces";

type FontainesProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
};

const Fontaines = ({ fontainesModeles, fontainesTarifs }: FontainesProps) => {
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const prospect = useProspectStore((s) => s.prospect);
  const setFontaines = useFontainesStore((s) => s.setFontaines);
  const setTotalFontaines = useTotalFontainesStore((s) => s.setTotalFontaines);
  const setFoodBeverage = useFoodBeverageStore((s) => s.setFoodBeverage);
  const effectif = prospect.effectif ?? 0;
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useScrollIntoFontainesEspace();

  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId - 1,
    }));
  };

  const handleAddEspace = () => {
    setFontaines((prev) => ({
      ...prev,
      nbEspaces: 1,
      espaces: [
        {
          infos: {
            espaceId: 1,
            typeEau: ["Eau froide"],
            marque: null,
            modele: null,
            reconditionne: false,
            poseSelected: null,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                : effectif,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoFiltres: null,
            prixUnitaireConsoCO2: null,
            prixUnitaireConsoEauChaude: null,
          },
        },
      ],
    }));
    setTotalFontaines({
      totalEspaces: [{ espaceId: 1, total: 0, totalInstallation: 0 }],
    });
  };

  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="4">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Droplets}
          title={tFontaines("fontaines-a-eau")}
          description={tFontaines(
            "eau-fraiche-ou-petillante-de-leau-pure-filtree-pour-tous-adaptees-a-votre-besoin-nos-fontaines-reseau-sont-a-poser-sur-pied-ou-sous-comptoir-la-gamme-determine-le-type-de-pose",
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Droplets}
          title={tFontaines("fontaines-a-eau")}
          description={tFontaines(
            "eau-fraiche-ou-petillante-de-leau-pure-filtree-pour-tous-adaptees-a-votre-besoin-nos-fontaines-reseau-sont-a-poser-sur-pied-ou-sous-comptoir-la-gamme-determine-le-type-de-pose",
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-hidden transition"
        ref={propositionsRef}
      >
        {isTabletOrMobile ? (
          <FontainesMobileEspaces
            fontainesModeles={fontainesModeles}
            fontainesTarifs={fontainesTarifs}
            handleAddEspace={handleAddEspace}
          />
        ) : (
          <FontainesDesktopEspaces
            fontainesModeles={fontainesModeles}
            fontainesTarifs={fontainesTarifs}
            handleAddEspace={handleAddEspace}
          />
        )}
      </div>
      {/* {isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null} */}
    </div>
  );
};

export default Fontaines;
