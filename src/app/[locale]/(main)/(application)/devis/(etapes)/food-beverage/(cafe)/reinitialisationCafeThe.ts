import { useCafeStore } from "@/stores/devis/cafeStore";
import { useTheStore } from "@/stores/devis/theStore";

export const reinitialisationCafeThe = () => {
  const resetThe = useTheStore.getState().reset;
  const setCafe = useCafeStore.getState().setCafe;
  setCafe({
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
  resetThe();
};
