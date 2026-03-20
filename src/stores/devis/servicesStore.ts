import { ServicesType } from "@/zod-schemas/services.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ServicesStore = {
  services: ServicesType;
  setServices: (
    value: ServicesType | ((prev: ServicesType) => ServicesType),
  ) => void;
  reset: () => void;
};

export const useServicesStore = create<ServicesStore>()(
  persist(
    (set) => ({
      services: { currentServiceId: 0 },
      setServices: (value) =>
        set((state) => ({
          services: typeof value === "function" ? value(state.services) : value,
        })),
      reset: () => set({ services: { currentServiceId: 0 } }),
    }),
    {
      name: "services",
    },
  ),
);
