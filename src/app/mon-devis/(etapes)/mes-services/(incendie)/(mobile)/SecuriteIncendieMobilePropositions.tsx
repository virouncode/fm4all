import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import React from "react";
import SecuriteIncendieMobileCards from "./SecuriteIncendieMobileCards";
import SecuriteIncendieMobileInputs from "./SecuriteIncendieMobileInputs";

type SecuriteIncendieMobilePropositionsProps = {
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
  nbExtincteurs: number;
  nbBaes: number;
  nbTelBaes: number;
  handleChangeNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => void;
  incendieQuantite: {
    nbExtincteurs: number;
    id: number;
    surface: number;
    createdAt: Date;
  };
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
  incendieTarifs: SelectIncendieTarifsType[];
};

const SecuriteIncendieMobilePropositions = ({
  propositions,
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
  handleClickProposition,
  incendieTarifs,
}: SecuriteIncendieMobilePropositionsProps) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl lg:hidden">
        Sécurité incendie : contrôles obligatoires
      </p>
      <SecuriteIncendieMobileInputs
        nbExtincteurs={nbExtincteurs}
        nbBaes={nbBaes}
        nbTelBaes={nbTelBaes}
        handleChangeNbr={handleChangeNbr}
        incendieQuantite={incendieQuantite}
        incendieTarifs={incendieTarifs}
      />
      <SecuriteIncendieMobileCards
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </div>
  );
};

export default SecuriteIncendieMobilePropositions;
