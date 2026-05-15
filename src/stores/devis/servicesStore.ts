"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { ServicesType } from "@/zod-schemas/services.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type ServicesStore = {
  services: ServicesType;
  setServices: (
    value: ServicesType | ((prev: ServicesType) => ServicesType),
  ) => void;
  reset: () => void;
};

const initialServices: ServicesType = { currentServiceId: 0 };

const createServicesStore = (): StoreApi<ServicesStore> =>
  create<ServicesStore>()(
    persist(
      (set) => ({
        services: initialServices,
        setServices: (value) =>
          set((state) => ({
            services:
              typeof value === "function" ? value(state.services) : value,
          })),
        reset: () => set(() => ({ services: initialServices })),
      }),
      { name: "services" },
    ),
  );

const ctx = createStoreContext<ServicesStore>(createServicesStore, "Services");

export const ServicesStoreProvider = ctx.Provider;
export const useServicesStore = ctx.useTypedStore;
export const useServicesStoreApi = ctx.useStoreApi;
