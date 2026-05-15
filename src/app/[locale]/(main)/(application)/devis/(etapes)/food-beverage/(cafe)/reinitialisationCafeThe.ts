"use client";

import { useCafeStoreApi } from "@/stores/devis/cafeStore";
import { useTheStoreApi } from "@/stores/devis/theStore";
import { useCallback } from "react";

export const useReinitialisationCafeThe = () => {
  const cafe = useCafeStoreApi();
  const the = useTheStoreApi();

  return useCallback(() => {
    cafe.getState().setCafe({
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
    the.getState().reset();
  }, [cafe, the]);
};
