"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const TICKET_VIEW_KEY = "fm4all:ticketView";

export type TicketView = "list" | "grid";

type UiStore = {
  // state
  ticketView: TicketView;

  // actions
  setTicketView: (view: TicketView) => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      // default state
      ticketView: "list",

      // actions
      setTicketView: (view) => set({ ticketView: view }),
    }),
    {
      name: TICKET_VIEW_KEY,
      // Ne persister que ticketView (pas les actions)
      partialize: (state) => ({ ticketView: state.ticketView }),
    }
  )
);
