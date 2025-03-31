import SecuriteIncendieFournisseurLogo from "../SecuriteIncendieFournisseurLogo";
import SecuriteIncendieInputs from "../SecuriteIncendieInputs";
import SecuriteIncendiePropostionCard from "../SecuriteIncendiePropostionCard";

type SecuriteIncendieDesktopPropositionsProps = {
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
};

const SecuriteIncendieDesktopPropositions = ({
  propositions,
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
  handleClickProposition,
}: SecuriteIncendieDesktopPropositionsProps) => {
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {propositions.length > 0 &&
        propositions.map((proposition) => (
          <div className="flex border-b flex-1" key={proposition.id}>
            <div className="flex w-1/4 items-center justify-between flex-col gap-10 p-4">
              <SecuriteIncendieFournisseurLogo {...proposition} />
              <SecuriteIncendieInputs
                nbExtincteurs={nbExtincteurs}
                nbBaes={nbBaes}
                nbTelBaes={nbTelBaes}
                handleChangeNbr={handleChangeNbr}
                incendieQuantite={incendieQuantite}
              />
              <p className="text-xs text-fm4alldestructive italic px-2 text-center">
                Les quantités sont estimées pour vous mais vous pouvez les
                changer
              </p>
            </div>
            <SecuriteIncendiePropostionCard
              proposition={proposition}
              handleClickProposition={handleClickProposition}
            />
          </div>
        ))}
    </div>
  );
};

export default SecuriteIncendieDesktopPropositions;
