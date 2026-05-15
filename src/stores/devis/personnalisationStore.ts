"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { PersonnalisationType } from "@/zod-schemas/personnalisation.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type PersonnalisationStore = {
  personnalisation: PersonnalisationType;
  setPersonnalisation: (
    value:
      | PersonnalisationType
      | ((prev: PersonnalisationType) => PersonnalisationType),
  ) => void;
  reset: () => void;
};

const initialPersonnalisation: PersonnalisationType = {
  currentPersonnalisationId: 1,
  personnalisationIds: [1],
};

const createPersonnalisationStore = (): StoreApi<PersonnalisationStore> =>
  create<PersonnalisationStore>()(
    persist(
      (set) => ({
        personnalisation: initialPersonnalisation,
        setPersonnalisation: (value) =>
          set((state) => ({
            personnalisation:
              typeof value === "function"
                ? value(state.personnalisation)
                : value,
          })),
        reset: () =>
          set(() => ({ personnalisation: initialPersonnalisation })),
      }),
      { name: "personnalisation" },
    ),
  );

const ctx = createStoreContext<PersonnalisationStore>(
  createPersonnalisationStore,
  "Personnalisation",
);

export const PersonnalisationStoreProvider = ctx.Provider;
export const usePersonnalisationStore = ctx.useTypedStore;
export const usePersonnalisationStoreApi = ctx.useStoreApi;
