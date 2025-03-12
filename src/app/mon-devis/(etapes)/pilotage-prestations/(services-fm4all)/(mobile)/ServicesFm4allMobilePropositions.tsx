type ServicesFm4allMobilePropositionsProps = {
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

const ServicesFm4allMobilePropositions = ({
  formattedPropositions,
  handleClickProposition,
  total,
}: ServicesFm4allMobilePropositionsProps) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl -mb-4">Services fm4all</p>
    </div>
  );
};

export default ServicesFm4allMobilePropositions;
