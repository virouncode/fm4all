import { FontaineMobilePropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(fontaine)/(mobile)/FontaineMobileEspacePropositionCard";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../../(cafe)/AddEspaceButton";
import FontaineMobileEspacePropositionsCarousel from "./FontaineMobileEspacePropositionsCarousel";

type FontaineMobileEspacePropositionsProps = {
  formattedPropositions: FontaineMobilePropositionItem[][];
  handleClickProposition: (proposition: FontaineMobilePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: FontaineMobilePropositionItem) => void;
  espace: FontaineEspaceType;
  fontainesEspacesIds: number[];
  handleAddEspace: () => void;
};

const FontaineMobileEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
  handleAddEspace,
}: FontaineMobileEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.fontaines");
  return (
    <div className="flex w-full flex-col gap-6">
      {formattedPropositions.map((propositions) => (
        <FontaineMobileEspacePropositionsCarousel
          propositions={propositions}
          key={propositions[0].entrepriseId}
          handleClickProposition={handleClickProposition}
          espace={espace}
          fontainesEspacesIds={fontainesEspacesIds}
          handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
        />
      ))}
      {fontainesEspacesIds.slice(-1)[0] === espace.infos.espaceId &&
      espace.infos.poseSelected ? (
        <div className="mt-2 flex items-center justify-center gap-4">
          <AddEspaceButton
            handleAddEspace={handleAddEspace}
            title={t("ajouter-un-espace-fontaine")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default FontaineMobileEspacePropositions;
