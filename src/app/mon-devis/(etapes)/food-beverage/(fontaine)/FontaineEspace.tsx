import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { toast } from "@/hooks/use-toast";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useContext } from "react";
import PreviousEspaceButton from "../(cafe)/PreviousEspaceButton";
import RetirerEspaceButton from "../(cafe)/RetirerEspaceButton";
import FontaineEspaceForm from "./FontaineEspaceForm";
import FontaineEspacePropositions from "./FontaineEspacePropositions";

type FontaineEspaceProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
  espace: FontaineEspaceType;
};

const FontaineEspace = ({
  fontainesModeles,
  fontainesTarifs,
  espace,
}: FontaineEspaceProps) => {
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
      className="h-full flex flex-col"
      id={`espace_fontaine_${espace.infos.espaceId}`}
    >
      {/* <FontaineEspaceSummary espace={espace} /> */}
      <div className="w-full flex justify-between items-start py-1">
        <FontaineEspaceForm
          espace={espace}
          fontainesModeles={fontainesModeles}
          fontainesTarifs={fontainesTarifs}
        />
        <div className="flex gap-2 items-center">
          {fontainesEspacesIds[0] !== espace.infos.espaceId && (
            <PreviousEspaceButton
              handleClickPreviousEspace={handleClickPreviousEspace}
            />
          )}
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
      </div>
      <FontaineEspacePropositions
        fontainesModeles={fontainesModeles}
        fontainesTarifs={fontainesTarifs}
        espace={espace}
      />
    </div>
  );
};

export default FontaineEspace;
