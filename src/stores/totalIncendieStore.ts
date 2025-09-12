import { TotalIncendieType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalIncendieStore {
  totalIncendie: TotalIncendieType;
  setTotalIncendie: (
    value: TotalIncendieType | ((prev: TotalIncendieType) => TotalIncendieType),
  ) => void;
}

export const useTotalIncendieStore = create<TotalIncendieStore>()(
  persist(
    (set) => ({
      totalIncendie: {
        totalTrilogie: null,
        totalExutoires: null,
        totalExutoiresParking: null,
        totalAlarmes: null,
        totalPortesCoupeFeuBattantes: null,
        totalPortesCoupeFeuCoulissantes: null,
        totalRIA: null,
        totalColonnesSechesStatiques: null,
        totalColonnesSechesDynamiques: null,
        totalDeplacementTrilogie: null,
        totalDeplacementExutoires: null,
        totalDeplacementExutoiresParking: null,
      },
      setTotalIncendie: (value) =>
        set((state) => ({
          totalIncendie:
            typeof value === "function" ? value(state.totalIncendie) : value,
        })),
    }),
    {
      name: "totalIncendie",
    },
  ),
);
