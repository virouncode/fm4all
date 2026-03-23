import NextServiceButton from "@/app/[locale]/(main)/(application)/devis/NextServiceButton";
import { FontaineMobilePropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(fontaine)/(mobile)/FontaineMobileEspacePropositionCard";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../../(cafe)/AddEspaceButton";
import NextEspaceButton from "../../(cafe)/NextEspaceButton";
import FontaineEspacePropositionCard from "../FontaineEspacePropositionCard";
import FontaineEspacePropositionPrestataireLogo from "../FontaineEspacePropositionPrestataireLogo";

type FontaineDesktopEspacePropositionsProps = {
  formattedPropositions: FontaineMobilePropositionItem[][];
  handleClickProposition: (proposition: FontaineMobilePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: FontaineMobilePropositionItem) => void;
  espace: FontaineEspaceType;
  fontainesEspacesIds: number[];
  handleAddEspace: () => void;
  handleClickNext: () => void;
  handleClickNextEspace: () => void;
  handleAlert: () => void;
};

const FontaineDesktopEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
  handleAddEspace,
  handleClickNext,
  handleClickNextEspace,
  handleAlert,
}: FontaineDesktopEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.fontaines");
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto">
      <div className="flex flex-1 flex-col overflow-auto rounded-xl border">
        {formattedPropositions.map((propositions) => (
          <div
            className="flex flex-1 border-b"
            key={propositions[0].entrepriseId}
          >
            <FontaineEspacePropositionPrestataireLogo {...propositions[0]} />
            {propositions.map((proposition) => (
              <FontaineEspacePropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                handleClickFirstEspaceProposition={
                  handleClickFirstEspaceProposition
                }
                espace={espace}
                fontainesEspacesIds={fontainesEspacesIds}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {fontainesEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
          <div className="flex items-center justify-end gap-4">
            {espace.infos.poseSelected ? (
              <AddEspaceButton
                handleAddEspace={handleAddEspace}
                title={t("ajouter-un-espace-fontaine")}
              />
            ) : null}
            <NextServiceButton handleClickNext={handleClickNext} />
          </div>
        ) : (
          <div className="ml-auto" onClick={handleAlert}>
            <NextEspaceButton
              disabled={espace.infos.poseSelected ? false : true}
              handleClickNextEspace={handleClickNextEspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FontaineDesktopEspacePropositions;
