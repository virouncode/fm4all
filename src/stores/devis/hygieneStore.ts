"use client";

import { HygieneType } from "@/zod-schemas/hygiene.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type HygieneStore = {
  hygiene: HygieneType;
  setHygiene: (
    value: HygieneType | ((prev: HygieneType) => HygieneType),
  ) => void;
  reset: () => void;
};

export const useHygieneStore = create<HygieneStore>()(
  persist(
    (set) => ({
      hygiene: {
        infos: {
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
          dureeLocation: "pa12M",
          trilogieGammeSelected: "essentiel",
          desinfectantGammeSelected: null,
          parfumGammeSelected: null,
          balaiGammeSelected: null,
          poubelleGammeSelected: null,
          commentaires: null,
        },
        quantites: {
          nbDistribEmp: null,
          nbDistribEmpPoubelle: null,
          nbDistribSavon: null,
          nbDistribPh: null,
          nbDistribDesinfectant: null,
          nbDistribParfum: null,
          nbDistribBalai: null,
          nbDistribPoubelle: null,
        },
        prix: {
          prixDistribEmp: null,
          prixDistribEmpPoubelle: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixDistribDesinfectant: null,
          prixDistribParfum: null,
          prixDistribBalai: null,
          prixDistribPoubelle: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
          paParPersonneDesinfectant: null,
          minFacturation: null,
        },
      },
      setHygiene: (value) =>
        set((state) => ({
          hygiene: typeof value === "function" ? value(state.hygiene) : value,
        })),
      reset: () =>
        set({
          hygiene: {
            infos: {
              entrepriseId: null,
              nomPrestataire: null,
              sloganPrestataire: null,
              logoStorageKey: null,
              dureeLocation: "pa12M",
              trilogieGammeSelected: "essentiel",
              desinfectantGammeSelected: null,
              parfumGammeSelected: null,
              balaiGammeSelected: null,
              poubelleGammeSelected: null,
              commentaires: null,
            },
            quantites: {
              nbDistribEmp: null,
              nbDistribEmpPoubelle: null,
              nbDistribSavon: null,
              nbDistribPh: null,
              nbDistribDesinfectant: null,
              nbDistribParfum: null,
              nbDistribBalai: null,
              nbDistribPoubelle: null,
            },
            prix: {
              prixDistribEmp: null,
              prixDistribEmpPoubelle: null,
              prixDistribSavon: null,
              prixDistribPh: null,
              prixDistribDesinfectant: null,
              prixDistribParfum: null,
              prixDistribBalai: null,
              prixDistribPoubelle: null,
              prixInstalDistrib: null,
              paParPersonneEmp: null,
              paParPersonneSavon: null,
              paParPersonnePh: null,
              paParPersonneDesinfectant: null,
              minFacturation: null,
            },
          },
        }),
    }),
    { name: "hygiene" },
  ),
);
