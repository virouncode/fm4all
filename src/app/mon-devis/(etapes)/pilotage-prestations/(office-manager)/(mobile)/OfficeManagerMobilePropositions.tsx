import OfficeManagerMobileInputs from "./OfficeManagerMobileInputs";
import OfficeManagerMobilePropositionCard from "./OfficeManagerMobilePropositionCard";

type OfficeManagerMobilePropositionsProps = {
  propositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }[];
  demiJParSemaineEssentiel: number | null;
  demiJParSemaineConfort: number | null;
  demiJParSemaineExcellence: number | null;
  handleChangeDemiJParSemaine: (
    value: number[],
    demiTauxJournalier: number | null
  ) => void;
  handleChangeRemplace: (value: string) => void;
  handleCheckPremium: (checked: boolean) => void;
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }) => void;
};

const OfficeManagerMobilePropositions = ({
  propositions,
  demiJParSemaineEssentiel,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  handleCheckPremium,
  handleClickProposition,
}: OfficeManagerMobilePropositionsProps) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl lg:hidden">Hof Manager</p>
      <OfficeManagerMobileInputs
        demiJParSemaineEssentiel={demiJParSemaineEssentiel}
        handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
        handleChangeRemplace={handleChangeRemplace}
        handleCheckPremium={handleCheckPremium}
      />
      {propositions.map((proposition) => (
        <OfficeManagerMobilePropositionCard
          proposition={proposition}
          key={proposition.fournisseurId}
          handleClickProposition={handleClickProposition}
          demiJParSemaineConfort={demiJParSemaineConfort}
          demiJParSemaineExcellence={demiJParSemaineExcellence}
        />
      ))}
      <p className="text-xs">
        *selon lieu d&apos;exécution les demi journées pourront être proposées
        en télétravail
      </p>
    </div>
  );
};

export default OfficeManagerMobilePropositions;
