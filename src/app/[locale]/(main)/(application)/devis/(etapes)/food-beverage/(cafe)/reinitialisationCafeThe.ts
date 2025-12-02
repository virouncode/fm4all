import { useCafeStore } from "@/stores/cafeStore";
import { useTheStore } from "@/stores/theStore";
import { useTotalCafeStore } from "@/stores/totalCafeStore";
import { useTotalTheStore } from "@/stores/totalTheStore";

export const reinitialisationCafeThe = () => {
  const resetThe = useTheStore.getState().reset;
  const resetTotalThe = useTotalTheStore.getState().reset;
  const setCafe = useCafeStore.getState().setCafe;
  const setTotalCafe = useTotalCafeStore.getState().setTotalCafe;
  setCafe({
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
  setTotalCafe({
    totalEspaces: [],
  });
  resetThe();
  resetTotalThe();
};
