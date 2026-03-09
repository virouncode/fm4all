"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const UI_STORE_KEY = "fm4all:ui";

export type TicketView = "list" | "grid";
export type PrestationView = "list" | "grid";
export type EntrepriseView = "list" | "grid";

type UiStoreType = {
  // state
  ticketView: TicketView;
  prestationView: PrestationView;
  entrepriseView: EntrepriseView;

  // actions
  setTicketView: (view: TicketView) => void;
  setPrestationView: (view: PrestationView) => void;
  setEntrepriseView: (view: EntrepriseView) => void;
};

export const useUiStore = create<UiStoreType>()(
  persist(
    (set) => ({
      // default state
      ticketView: "list",
      prestationView: "list",
      entrepriseView: "list",

      // actions
      setTicketView: (view) => set({ ticketView: view }),
      setPrestationView: (view) => set({ prestationView: view }),
      setEntrepriseView: (view) => set({ entrepriseView: view }),
    }),
    {
      name: UI_STORE_KEY,
      partialize: (state) => ({
        ticketView: state.ticketView,
        prestationView: state.prestationView,
        entrepriseView: state.entrepriseView,
      }),
    }
  )
);
