import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { toast } from "@/hooks/use-toast";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useContext } from "react";
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
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId
  );
  const handleClickPreviousEspace = () => {
    const currentEspaceIdIndex = fontainesEspacesIds.indexOf(
      espace.infos.espaceId
    );
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: prev.espaces[currentEspaceIdIndex - 1].infos.espaceId,
      },
    }));
  };

  const handleClickRemove = () => {
    if (fontainesEspacesIds[0] === espace.infos.espaceId) {
      //TODO : Je reinitialise tout
      setFontaines({
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
          currentEspaceId: 1,
          dureeLocation: "pa12M",
          commentaires: null,
        },
        nbEspaces: null,
        espaces: [],
      });
      setTotalFontaines({
        totalEspaces: [],
      });
      return;
    }
    const indexOfCurrentEspace = fontainesEspacesIds.indexOf(
      espace.infos.espaceId
    );
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: fontainesEspacesIds[indexOfCurrentEspace - 1],
      },
      espaces: prev.espaces.filter(
        (item) => item.infos.espaceId !== espace.infos.espaceId
      ),
    }));
    setTotalFontaines((prev) => ({
      totalEspaces: prev.totalEspaces.filter(
        (item) => item.espaceId !== espace.infos.espaceId
      ),
    }));
  };

  const handleAlert = () => {
    if (
      fontainesEspacesIds.slice(-1)[0] !== espace.infos.espaceId &&
      fontainesEspacesIds[0] !== espace.infos.espaceId
    ) {
      toast({
        description: "Veuillez d'abord retirer les espaces suivants",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden gap-4 mt-10"
      id={`espace_${espace.infos.espaceId}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">
          Espace fontaine n°{espace.infos.espaceId}
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
