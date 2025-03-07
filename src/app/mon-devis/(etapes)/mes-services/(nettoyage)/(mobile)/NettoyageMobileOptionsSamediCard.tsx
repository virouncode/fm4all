type NettoyageMobileOptionsSamediPropositionsProps = {
  samediProposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickSamediProposition: (proposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  color: string;
};

const NettoyageMobileOptionsSamediCard = ({
  samediProposition,
  handleClickSamediProposition,
}: NettoyageMobileOptionsSamediPropositionsProps) => {
  return <div></div>;
};

export default NettoyageMobileOptionsSamediCard;
