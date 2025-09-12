import { TheType } from "@/zod-schemas/the";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientStore } from "./clientStore";

interface TheStore {
  the: TheType;
  setThe: (value: TheType | ((prev: TheType) => TheType)) => void;
}

const clientEffectif = useClientStore.getState().client.effectif ?? 0;

export const useTheStore = create<TheStore>()(
  persist(
    (set) => ({
      the: {
        infos: {
          gammeSelected: null,
          commentaires: null,
        },
        quantites: {
          nbPersonnes: Math.round(clientEffectif * 0.15),
        },
        prix: {
          prixUnitaire: null,
        },
      },
      setThe: (value) =>
        set((state) => ({
          the: typeof value === "function" ? value(state.the) : value,
        })),
    }),
    {
      name: "the",
    },
  ),
);
