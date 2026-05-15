"use client";

import { SERVICES_FM4ALL_DEFAULT_VALUES } from "@/constants/constants";
import { createStoreContext } from "@/stores/lib/createStoreContext";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type ServicesFm4AllStore = {
  servicesFm4All: ServicesFm4AllType;
  setServicesFm4All: (
    value:
      | ServicesFm4AllType
      | ((prev: ServicesFm4AllType) => ServicesFm4AllType),
  ) => void;
  reset: () => void;
};

const createServicesFm4AllStore = (): StoreApi<ServicesFm4AllStore> =>
  create<ServicesFm4AllStore>()(
    persist(
      (set) => ({
        servicesFm4All: SERVICES_FM4ALL_DEFAULT_VALUES,
        setServicesFm4All: (value) =>
          set((state) => ({
            servicesFm4All:
              typeof value === "function" ? value(state.servicesFm4All) : value,
          })),
        reset: () =>
          set(() => ({ servicesFm4All: SERVICES_FM4ALL_DEFAULT_VALUES })),
      }),
      { name: "servicesFm4All" },
    ),
  );

const ctx = createStoreContext<ServicesFm4AllStore>(
  createServicesFm4AllStore,
  "ServicesFm4All",
);

export const ServicesFm4AllStoreProvider = ctx.Provider;
export const useServicesFm4AllStore = ctx.useTypedStore;
export const useServicesFm4AllStoreApi = ctx.useStoreApi;
