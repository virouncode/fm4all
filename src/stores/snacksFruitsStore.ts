import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientStore } from "./clientStore";

interface SnacksFruitsStore {
  snacksFruits: SnacksFruitsType;
  setSnacksFruits: (
    value: SnacksFruitsType | ((prev: SnacksFruitsType) => SnacksFruitsType),
  ) => void;
}

const clientEffectif = useClientStore.getState().client.effectif ?? 0;

export const useSnacksFruitsStore = create<SnacksFruitsStore>()(
  persist(
    (set) => ({
      snacksFruits: {
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          isSameFournisseur: false,
          gammeSelected: null,
          choix: ["fruits"],
          commentaires: null,
        },
        quantites: {
          nbPersonnes: clientEffectif,
          fruitsKgParSemaine: 0,
          snacksPortionsParSemaine: 0,
          boissonsConsosParSemaine: 0,
        },
        prix: {
          prixKgFruits: null,
          prixUnitaireSnacks: null,
          prixUnitaireBoissons: null,
          prixUnitaireLivraisonSiCafe: null,
          prixUnitaireLivraison: null,
          seuilFranco: null,
          panierMin: null,
        },
      },
      setSnacksFruits: (value) =>
        set((state) => ({
          snacksFruits:
            typeof value === "function" ? value(state.snacksFruits) : value,
        })),
    }),
    {
      name: "snacksFruits",
    },
  ),
);
