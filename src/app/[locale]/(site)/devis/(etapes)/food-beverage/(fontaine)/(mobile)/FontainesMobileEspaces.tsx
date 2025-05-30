import { Button } from "@/components/ui/button";
import { FontainesContext } from "@/context/FontainesProvider";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useContext } from "react";
import FontaineMobileEspace from "./FontaineMobileEspace";
import { useTranslations } from "next-intl";

type FontainesMobileEspacesProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
  handleAddEspace: () => void;
};

const FontainesMobileEspaces = ({
  fontainesModeles,
  fontainesTarifs,
  handleAddEspace,
}: FontainesMobileEspacesProps) => {
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const { fontaines } = useContext(FontainesContext);
  return fontaines.nbEspaces && fontaines.nbEspaces > 0 ? (
    fontaines.espaces.map((espace) => (
      <FontaineMobileEspace
        key={espace.infos.espaceId}
        espace={espace}
        fontainesModeles={fontainesModeles}
        fontainesTarifs={fontainesTarifs}
      />
    ))
  ) : (
    <div className="flex justify-center">
      <Button
        variant="outline"
        size="lg"
        className="text-base"
        onClick={handleAddEspace}
      >
        {tFontaines("ajouter-un-espace-fontaine")}
      </Button>
    </div>
  );
};

export default FontainesMobileEspaces;
