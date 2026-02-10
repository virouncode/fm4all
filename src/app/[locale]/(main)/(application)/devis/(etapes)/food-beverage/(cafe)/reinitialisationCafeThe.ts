import { useCafeStore } from "@/stores/devis/cafeStore";
import { useTheStore } from "@/stores/devis/theStore";
import { useTotalCafeStore } from "@/stores/devis/totalCafeStore";
import { useTotalTheStore } from "@/stores/devis/totalTheStore";

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
