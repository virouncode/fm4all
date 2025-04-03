"use client";
import PropositionsTitleMobile from "@/app/[locale]/devis/PropositionsTitleMobile";
import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { FontainesContext } from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import useScrollIntoFontainesEspace from "@/hooks/use-scroll-into-fontaines-espace";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
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
  const { client } = useContext(ClientContext);
  const { setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const effectif = client.effectif ?? 0;
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
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="4">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Droplets}
          title={tFontaines("fontaines-a-eau")}
          description={tFontaines(
            "eau-fraiche-ou-petillante-de-leau-pure-filtree-pour-tous-adaptees-a-votre-besoin-nos-fontaines-reseau-sont-a-poser-sur-pied-ou-sous-comptoir-la-gamme-determine-le-type-de-pose"
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Droplets}
          title={tFontaines("fontaines-a-eau")}
          description={tFontaines(
            "eau-fraiche-ou-petillante-de-leau-pure-filtree-pour-tous-adaptees-a-votre-besoin-nos-fontaines-reseau-sont-a-poser-sur-pied-ou-sous-comptoir-la-gamme-determine-le-type-de-pose"
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
