import { toast } from "@/hooks/use-toast";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles.schema";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs.schema";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";
import RetirerEspaceButton from "../../(cafe)/RetirerEspaceButton";
import FontaineEspaceForm from "../FontaineEspaceForm";
import FontaineEspacePropositions from "../FontaineEspacePropositions";

type FontainesMobileEspacesProps = {
  espace: FontaineEspaceType;
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
};

const FontaineMobileEspace = ({
  espace,
  fontainesModeles,
  fontainesTarifs,
}: FontainesMobileEspacesProps) => {
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const { fontaines, setFontaines } = useFontainesStore(
    useShallow((s) => ({
      fontaines: s.fontaines,
      setFontaines: s.setFontaines,
    })),
  );
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId,
  );

  const handleClickRemove = () => {
    if (fontainesEspacesIds[0] === espace.infos.espaceId) {
      //TODO : Je reinitialise tout
      setFontaines({
        infos: {
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
          currentEspaceId: 1,
          dureeLocation: "pa12M",
          commentaires: null,
        },
        nbEspaces: null,
        espaces: [],
      });
      return;
    }
    const indexOfCurrentEspace = fontainesEspacesIds.indexOf(
      espace.infos.espaceId,
    );
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: fontainesEspacesIds[indexOfCurrentEspace - 1],
      },
      espaces: prev.espaces.filter(
        (item) => item.infos.espaceId !== espace.infos.espaceId,
      ),
    }));
  };

  const handleAlert = () => {
    if (
      fontainesEspacesIds.slice(-1)[0] !== espace.infos.espaceId &&
      fontainesEspacesIds[0] !== espace.infos.espaceId
    ) {
      toast({
        description: tCafe("veuillez-dabord-retirer-les-espaces-suivants"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="mt-10 flex h-full flex-col gap-4 overflow-hidden"
      id={`espace_${espace.infos.espaceId}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">
          {tFontaines("espace-fontaine-n")}
          {espace.infos.espaceId}
        </p>
        <div onClick={handleAlert}>
          <RetirerEspaceButton
            handleClickRemove={handleClickRemove}
            disabled={
              fontainesEspacesIds[0] !== espace.infos.espaceId &&
              fontainesEspacesIds.slice(-1)[0] !== espace.infos.espaceId
            }
            all={fontainesEspacesIds[0] === espace.infos.espaceId}
            espaceId={espace.infos.espaceId}
          />
        </div>
      </div>
      <FontaineEspaceForm
        espace={espace}
        fontainesModeles={fontainesModeles}
        fontainesTarifs={fontainesTarifs}
      />
      <FontaineEspacePropositions
        espace={espace}
        fontainesModeles={fontainesModeles}
        fontainesTarifs={fontainesTarifs}
      />
    </div>
  );
};

export default FontaineMobileEspace;
