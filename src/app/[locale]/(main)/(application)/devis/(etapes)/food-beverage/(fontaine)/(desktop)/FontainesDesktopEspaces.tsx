import { Button } from "@/components//ui/button";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles.schema";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs.schema";
import { useTranslations } from "next-intl";
import FontaineEspace from "../FontaineEspace";

type FontainesDesktopEspacesProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
  handleAddEspace: () => void;
};

const FontainesDesktopEspaces = ({
  fontainesModeles,
  fontainesTarifs,
  handleAddEspace,
}: FontainesDesktopEspacesProps) => {
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const fontaines = useFontainesStore((s) => s.fontaines);
  return fontaines.nbEspaces && fontaines.nbEspaces > 0 ? (
    fontaines.espaces.map((espace) => (
      <FontaineEspace
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

export default FontainesDesktopEspaces;
