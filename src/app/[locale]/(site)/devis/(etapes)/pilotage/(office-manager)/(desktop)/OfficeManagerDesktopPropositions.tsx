import OfficeManagerFournisseurLogo from "../OfficeManagerFournisseurLogo";
import OfficeManagerInputs from "../OfficeManagerInputs";
import OfficeManagerPropositionCard from "../OfficeManagerPropositionCard";

type OfficeManagerDesktopPropositionsProps = {
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
    demiTauxJournalier: number | null,
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

const OfficeManagerDesktopPropositions = ({
  propositions,
  demiJParSemaineEssentiel,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  handleCheckPremium,
  handleClickProposition,
}: OfficeManagerDesktopPropositionsProps) => {
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      {propositions.length > 0
        ? propositions.map((proposition) => (
            <div
              className="flex flex-1 border-b"
              key={proposition.fournisseurId}
            >
              <div className="flex w-1/4 flex-col items-center justify-center gap-6 p-4">
                <OfficeManagerFournisseurLogo {...proposition} />
                <OfficeManagerInputs
                  demiJParSemaineEssentiel={demiJParSemaineEssentiel}
                  handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
                  handleChangeRemplace={handleChangeRemplace}
                  demiTjm={proposition.demiTjm}
                  demiTjmPremium={proposition.demiTjmPremium}
                  handleCheckPremium={handleCheckPremium}
                />
              </div>
              <OfficeManagerPropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                demiJParSemaineConfort={demiJParSemaineConfort}
                demiJParSemaineExcellence={demiJParSemaineExcellence}
              />
            </div>
          ))
        : null}
    </div>
  );
};

export default OfficeManagerDesktopPropositions;
