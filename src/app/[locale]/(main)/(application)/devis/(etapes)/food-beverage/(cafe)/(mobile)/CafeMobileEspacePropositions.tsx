import { CafePropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(cafe)/(desktop)/CafeEspacePropositionCard";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../AddEspaceButton";
import CafeMobileEspacePropositionsCarousel from "./CafeMobileEspacePropositionsCarousel";

type CafeMobileEspacePropositionsProps = {
  formattedPropositions: CafePropositionItem[][];
  handleClickProposition: (proposition: CafePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: CafePropositionItem) => void;
  espace: CafeEspaceType;
  cafeEspacesIds: number[];
  handleAddEspace: () => void;
};

const CafeMobileEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  cafeEspacesIds,
  handleAddEspace,
}: CafeMobileEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  return (
    <div className="flex w-full flex-col gap-6">
      {formattedPropositions.map((propositions) => (
        <CafeMobileEspacePropositionsCarousel
          propositions={propositions}
          key={propositions[0].entrepriseId}
          handleClickProposition={handleClickProposition}
          espace={espace}
          cafeEspacesIds={cafeEspacesIds}
          handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
        />
      ))}
      {cafeEspacesIds.slice(-1)[0] === espace.infos.espaceId &&
      espace.infos.gammeCafeSelected ? (
        <div className="mt-2 flex items-center justify-center gap-4">
          <AddEspaceButton
            handleAddEspace={handleAddEspace}
            title={t("ajouter-un-espace-cafe")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default CafeMobileEspacePropositions;
