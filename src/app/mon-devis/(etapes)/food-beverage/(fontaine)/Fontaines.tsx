"use client";
import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import {
  FontainesContext,
  MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE,
} from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import useScrollIntoFontainesEspace from "@/hooks/use-scroll-into-fontaines-espace";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { Droplets } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import FontainesDesktopEspaces from "./(desktop)/FontainesDesktopEspaces";
import FontainesMobileEspaces from "./(mobile)/FontainesMobileEspaces";

type FontainesProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
};

const Fontaines = ({ fontainesModeles, fontainesTarifs }: FontainesProps) => {
  const { client } = useContext(ClientContext);
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const effectif = client.effectif ?? 0;
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const router = useRouter();
  useScrollIntoFontainesEspace();

  const handleClickNext = () => {
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 4, completedSteps: newCompletedSteps });
    router.push(`/mon-devis/pilotage-prestations?${searchParams.toString()}`);
  };

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
          title="Fontaines à eau"
          description="Eau fraîche ou pétillante, de l'eau pure filtrée pour tous. Adaptés à votre besoin, nos fontaines réseau sont à poser, sur pied ou sous comptoir"
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Droplets}
          title="Fontaines à eau"
          description="Eau fraîche ou pétillante, de l'eau pure filtrée pour tous. Adaptés à votre besoin, nos fontaines réseau sont à poser, sur pied ou sous comptoir"
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
      {!fontaines.nbEspaces && !isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default Fontaines;
