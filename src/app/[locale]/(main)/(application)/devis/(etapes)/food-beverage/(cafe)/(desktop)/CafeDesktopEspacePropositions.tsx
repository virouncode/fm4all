import NextServiceButton from "@/app/[locale]/(main)/(application)/devis/NextServiceButton";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../AddEspaceButton";
import CafeEspacePropositionPrestataireLogo from "../CafeEspacePropositionPrestataireLogo";
import NextEspaceButton from "../NextEspaceButton";
import CafeEspacePropositionCard from "./CafeEspacePropositionCard";
import type { CafePropositionItem } from "./CafeEspacePropositionCard";

type CafeDesktopEspacePropositionsProps = {
  formattedPropositions: CafePropositionItem[][];
  handleClickProposition: (proposition: CafePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: CafePropositionItem) => void;
  espace: CafeEspaceType;
  cafeEspacesIds: number[];
  handleAddEspace: () => void;
  handleClickNext: () => void;
  handleClickNextEspace: () => void;
  handleAlert: () => void;
};

const CafeDesktopEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  cafeEspacesIds,
  handleAddEspace,
  handleClickNext,
  handleClickNextEspace,
  handleAlert,
}: CafeDesktopEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto">
      <div className="flex flex-1 flex-col overflow-auto rounded-xl border">
        {formattedPropositions.map((propositions) => (
          <div
            className="flex flex-1 border-b"
            key={propositions[0].entrepriseId}
          >
            <CafeEspacePropositionPrestataireLogo {...propositions[0]} />
            {propositions.map((proposition) => (
              <CafeEspacePropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                handleClickFirstEspaceProposition={
                  handleClickFirstEspaceProposition
                }
                espace={espace}
                cafeEspacesIds={cafeEspacesIds}
              />
            ))}
          </div>
        ))}
      </div>
      {cafeEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
        <div className="flex items-center justify-end gap-4">
          {espace.infos.gammeCafeSelected ? (
            <AddEspaceButton
              handleAddEspace={handleAddEspace}
              title={t("ajouter-un-espace-cafe")}
            />
          ) : null}
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : (
        <div className="ml-auto" onClick={handleAlert}>
          <NextEspaceButton
            disabled={espace.infos.gammeCafeSelected ? false : true}
            handleClickNextEspace={handleClickNextEspace}
          />
        </div>
      )}
    </div>
  );
};

export default CafeDesktopEspacePropositions;
