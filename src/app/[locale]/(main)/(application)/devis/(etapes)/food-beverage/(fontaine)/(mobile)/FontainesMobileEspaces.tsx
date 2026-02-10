import { Button } from "@/components/ui/button";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useTranslations } from "next-intl";
import FontaineMobileEspace from "./FontaineMobileEspace";

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
  const fontaines = useFontainesStore((s) => s.fontaines);
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
