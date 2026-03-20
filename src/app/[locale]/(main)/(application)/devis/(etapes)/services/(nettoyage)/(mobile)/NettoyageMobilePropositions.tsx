import { GammeType } from "@/zod-schemas/gamme.schema";
import NettoyageMobilePropositionsCarousel from "./NettoyageMobilePropositionsCarousel";
import { useTranslations } from "next-intl";

type NettoyageMobilePropositionsProps = {
  handleClickProposition: (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => void;
  formattedPropositions: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }[][];
};

const NettoyageMobilePropositions = ({
  handleClickProposition,
  formattedPropositions,
}: NettoyageMobilePropositionsProps) => {
  const t = useTranslations("DevisPage.services.nettoyage");
  return (
    <div className="flex w-full flex-col gap-6">
      <p className="-mb-4 text-xl font-bold">{t("nettoyage")}</p>
      {formattedPropositions.map((propositions) => (
        <NettoyageMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].entrepriseId}
          handleClickProposition={handleClickProposition}
        />
      ))}
    </div>
  );
};

export default NettoyageMobilePropositions;
