import { IncendieContext } from "@/context/IncendieProvider";
import { useContext } from "react";
import SecuriteIncendieMobileCard from "./SecuriteIncendieMobileCard";

type SecuriteIncendieMobileCardsProps = {
  propositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }[];
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }) => void;
};

const SecuriteIncendieMobileCards = ({
  propositions,
  handleClickProposition,
}: SecuriteIncendieMobileCardsProps) => {
  const { incendie } = useContext(IncendieContext);

  return (
    <div className="flex flex-col gap-6 w-full">
      {propositions.map((proposition) => (
        <SecuriteIncendieMobileCard
          key={proposition.fournisseurId}
          proposition={proposition}
          handleClickProposition={handleClickProposition}
        />
      ))}
    </div>
  );
};

export default SecuriteIncendieMobileCards;
