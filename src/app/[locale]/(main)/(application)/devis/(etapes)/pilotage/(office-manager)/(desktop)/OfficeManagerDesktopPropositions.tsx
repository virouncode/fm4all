import OfficeManagerPrestataireLogo from "../OfficeManagerPrestataireLogo";
import OfficeManagerInputs from "../OfficeManagerInputs";
import OfficeManagerPropositionCard from "../OfficeManagerPropositionCard";

type OfficeManagerDesktopPropositionsProps = {
  propositions: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
    imageStorageKey: string | null;
  }[];
  demiJParSemaineEssentiel: number | null;
  demiJParSemaineConfort: number | null;
  demiJParSemaineExcellence: number | null;
  handleChangeDemiJParSemaine: (value: number[]) => void;
  handleChangeRemplace: (value: string) => void;
  handleCheckPremium: (checked: boolean) => void;
  handleClickProposition: (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
    imageStorageKey: string | null;
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
              key={proposition.entrepriseId}
            >
              <div className="flex w-1/4 flex-col items-center justify-center gap-6 p-4">
                <OfficeManagerPrestataireLogo {...proposition} />
                <OfficeManagerInputs
                  demiJParSemaineEssentiel={demiJParSemaineEssentiel}
                  handleChangeDemiJParSemaine={handleChangeDemiJParSemaine}
                  handleChangeRemplace={handleChangeRemplace}
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
