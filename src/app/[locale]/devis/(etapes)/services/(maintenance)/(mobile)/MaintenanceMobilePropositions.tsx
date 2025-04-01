import { useTranslations } from "next-intl";
import MaintenanceMobilePropositionsCarousel from "./MaintenanceMobilePropositionsCarousel";

type MaintenanceMobilePropositionsProps = {
  formattedPropositions: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
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
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
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
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl lg:hidden">
        {t("maintenance-multi-technique")}
      </p>
      {formattedPropositions.map((propositions) => (
        <MaintenanceMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].fournisseurId}
          handleClickProposition={handleClickProposition}
        />
      ))}
    </div>
  );
};

export default MaintenanceMobilePropositions;
