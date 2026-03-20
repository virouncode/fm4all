import { useTranslations } from "next-intl";
import MaintenanceMobilePropositionsCarousel from "./MaintenanceMobilePropositionsCarousel";

type MaintenanceMobilePropositionsProps = {
  formattedPropositions: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }[][];
  handleClickProposition: (proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }) => void;
};

const MaintenanceMobilePropositions = ({
  formattedPropositions,
  handleClickProposition,
}: MaintenanceMobilePropositionsProps) => {
  const t = useTranslations("DevisPage.services.maintenance");
  return (
    <div className="flex w-full flex-col gap-6">
      <p className="text-xl font-bold lg:hidden">
        {t("maintenance-multi-technique")}
      </p>
      {formattedPropositions.map((propositions) => (
        <MaintenanceMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].entrepriseId}
          handleClickProposition={handleClickProposition}
        />
      ))}
      <p className="px-1 text-end text-xs italic">
        {t(
          "batiment-entier-budget-a-confirmer-apres-visite-technique-des-installations-chaud-froid-clos-et-couverts",
        )}
      </p>
    </div>
  );
};

export default MaintenanceMobilePropositions;
