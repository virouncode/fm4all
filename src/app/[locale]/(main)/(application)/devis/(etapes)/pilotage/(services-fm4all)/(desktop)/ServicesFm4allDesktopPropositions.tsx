import { GammeType } from "@/zod-schemas/gamme.schema";
import { ServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4All.schema";
import ServicesFm4AllPrestataireLogo from "../ServicesFm4AllPrestataireLogo";
import ServicesFm4AllPropositionCard from "../ServicesFm4AllPropositionCard";

type ServicesFm4allDesktopPropositionsProps = {
  formattedPropositions: {
    id: string;
    gamme: GammeType;
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
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }[];
  handleClickProposition: (proposition: {
    id: string;
    gamme: GammeType;
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
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }) => void;
  total: number;
};

const ServicesFm4allDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
  total,
}: ServicesFm4allDesktopPropositionsProps) => {
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      <div className="flex flex-1 border-b">
        <ServicesFm4AllPrestataireLogo />
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
