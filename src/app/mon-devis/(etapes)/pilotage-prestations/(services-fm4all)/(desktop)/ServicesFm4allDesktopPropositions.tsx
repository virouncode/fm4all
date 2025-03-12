import ServicesFm4AllFournisseurLogo from "../ServicesFm4AllFournisseurLogo";
import ServicesFm4AllPropositionCard from "../ServicesFm4AllPropositionCard";

type ServicesFm4allDesktopPropositionsProps = {
  formattedPropositions: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }[];
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
  }) => void;
  total: number;
};

const ServicesFm4allDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
  total,
}: ServicesFm4allDesktopPropositionsProps) => {
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      <div className="flex border-b flex-1">
        <ServicesFm4AllFournisseurLogo />
        {formattedPropositions.map((proposition) => (
          <ServicesFm4AllPropositionCard
            key={proposition.id}
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            total={total}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesFm4allDesktopPropositions;
