import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { useTranslations } from "next-intl";
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
    type: "extincteur" | "baes" | "telBaes",
  ) => void;
  incendieQuantite: SelectIncendieQuantitesType;
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
  const t = useTranslations("DevisPage");
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      {propositions.length > 0 &&
        propositions.map((proposition) => (
          <div className="flex flex-1 border-b" key={proposition.id}>
            <div className="flex w-1/4 flex-col items-center justify-between gap-10 p-4">
              <SecuriteIncendieFournisseurLogo {...proposition} />
              <SecuriteIncendieInputs
                nbExtincteurs={nbExtincteurs}
                nbBaes={nbBaes}
                nbTelBaes={nbTelBaes}
                handleChangeNbr={handleChangeNbr}
                incendieQuantite={incendieQuantite}
              />
              <p className="text-destructive px-2 text-center text-xs italic">
                {t(
                  "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
                )}
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
