"use client";

import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { ManagementContext } from "@/context/ManagementProvider";
import useScrollIntoManagement from "@/hooks/use-scroll-into-management";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs";
import { UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import OfficeManagerPropositions from "./OfficeManagerPropositions";

type OfficeManagerProps = {
  officeManagerQuantites: SelectOfficeManagerQuantitesType[];
  officeManagerTarifs: SelectOfficeManagerTarifsType[];
};

const OfficeManager = ({
  officeManagerQuantites,
  officeManagerTarifs,
}: OfficeManagerProps) => {
  const tPilotage = useTranslations("DevisPage.pilotage");
  const { setManagement } = useContext(ManagementContext);
  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    setManagement((prev) => ({
      currentManagementId: prev.currentManagementId + 1,
    }));
  };
  useScrollIntoManagement();

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Office/Hospitality Manager"
          description={tPilotage(
            "gestion-operationnelle-sur-site-animation-des-bureaux-contact-direct-avec-les-occupants-gestion-des-imprevus-en-temps-reel-un-expert-metier-dedie-directement-chez-vous-pour-tout-gerer-le-nombre-de-demi-journees-dintervention-determine-la-gamme"
          )}
          icon={UserRoundCog}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title="Office/Hospitality Manager"
          description={tPilotage(
            "gestion-operationnelle-sur-site-animation-des-bureaux-contact-direct-avec-les-occupants-gestion-des-imprevus-en-temps-reel-un-expert-metier-dedie-directement-chez-vous-pour-tout-gerer-le-nombre-de-demi-journees-dintervention-determine-la-gamme"
          )}
          icon={UserRoundCog}
          handleClickPrevious={handleClickPrevious}
          previousButton={false}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        <OfficeManagerPropositions
          officeManagerQuantites={officeManagerQuantites}
          officeManagerTarifs={officeManagerTarifs}
        />
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter
          handleClickNext={handleClickNext}
          comment={tPilotage(
            "selon-lieu-dexecution-les-demi-journees-pourront-etre-proposees-en-teletravail"
          )}
        />
      ) : null}
    </div>
  );
};

export default OfficeManager;
