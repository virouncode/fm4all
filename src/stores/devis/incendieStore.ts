"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { IncendieType } from "@/zod-schemas/incendie.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type IncendieStore = {
  incendie: IncendieType;
  setIncendie: (
    value: IncendieType | ((prev: IncendieType) => IncendieType),
  ) => void;
  reset: () => void;
};

const initialIncendie: IncendieType = {
  infos: {
    entrepriseId: null,
    nomPrestataire: null,
    sloganPrestataire: null,
    logoStorageKey: null,
    commentaires: null,
  },
  quantites: {
    nbExtincteurs: null,
    nbBaes: null,
    nbTelBaes: null,
    nbExutoires: null,
    nbExutoiresParking: null,
    nbAlarmes: null,
    nbPortesCoupeFeuBattantes: null,
    nbPortesCoupeFeuCoulissantes: null,
    nbRIA: null,
    nbColonnesSechesStatiques: null,
    nbColonnesSechesDynamiques: null,
  },
  prix: {
    prixParExtincteur: null,
    prixParBaes: null,
    prixParTelBaes: null,
    prixParExutoire: null,
    prixParExutoireParking: null,
    prixParAlarme: null,
    prixParPorteCoupeFeuBattante: null,
    prixParProteCoupeFeuCoulissante: null,
    prixParRIA: null,
    prixParColonneSecheStatique: null,
    prixParColonneSecheDynamique: null,
    fraisDeplacementTrilogie: null,
    fraisDeplacementExutoires: null,
    fraisDeplacementExutoiresParking: null,
  },
};

const createIncendieStore = (): StoreApi<IncendieStore> =>
  create<IncendieStore>()(
    persist(
      (set) => ({
        incendie: initialIncendie,
        setIncendie: (value) =>
          set((state) => ({
            incendie:
              typeof value === "function" ? value(state.incendie) : value,
          })),
        reset: () => set(() => ({ incendie: initialIncendie })),
      }),
      { name: "incendie" },
    ),
  );

const ctx = createStoreContext<IncendieStore>(createIncendieStore, "Incendie");

export const IncendieStoreProvider = ctx.Provider;
export const useIncendieStore = ctx.useTypedStore;
export const useIncendieStoreApi = ctx.useStoreApi;
