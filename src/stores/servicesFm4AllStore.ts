"use client";

import { SERVICES_FM4ALL_DEFAULT_VALUES } from "@/constants/constants";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ServicesFm4AllStore = {
  servicesFm4All: ServicesFm4AllType;
  setServicesFm4All: (
    value:
      | ServicesFm4AllType
      | ((prev: ServicesFm4AllType) => ServicesFm4AllType),
  ) => void;
};

export const useServicesFm4AllStore = create<ServicesFm4AllStore>()(
  persist(
    (set) => ({
      servicesFm4All: SERVICES_FM4ALL_DEFAULT_VALUES,
      setServicesFm4All: (value) =>
        set((state) => ({
          servicesFm4All:
            typeof value === "function" ? value(state.servicesFm4All) : value,
        })),
    }),
    { name: "servicesFm4All" },
  ),
);
