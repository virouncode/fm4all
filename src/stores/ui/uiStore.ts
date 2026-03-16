"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const UI_STORE_KEY = "fm4all:ui";

export type TicketViewType = "list" | "grid";
export type PrestationViewType = "list" | "grid";
export type EntrepriseViewType = "list" | "grid";
export type DevisDemandeViewType = "list" | "grid";
export type DevisViewType = "list" | "grid";
export type FactureViewType = "list" | "grid";
export type DocumentViewType = "list" | "grid";
export type CalendarViewType =
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listMonth";
export type CalendarSlotDurationType = "00:15:00" | "00:30:00" | "01:00:00";

type UiStoreType = {
  // state
  TicketViewType: TicketViewType;
  PrestationViewType: PrestationViewType;
  EntrepriseViewType: EntrepriseViewType;
  DevisDemandeViewType: DevisDemandeViewType;
  DevisViewType: DevisViewType;
  FactureViewType: FactureViewType;
  DocumentViewType: DocumentViewType;
  CalendarViewType: CalendarViewType;
  CalendarSlotMinTime: string;
  CalendarSlotMaxTime: string;
  CalendarSlotDuration: CalendarSlotDurationType;
  /** Sélection persistée des filtres calendrier */
  CalendarSelectedClientIds: string[];
  CalendarSelectedSiteIds: string[];
  CalendarSelectedServiceIds: string[];

  // actions
  setTicketViewType: (view: TicketViewType) => void;
  setPrestationViewType: (view: PrestationViewType) => void;
  setEntrepriseViewType: (view: EntrepriseViewType) => void;
  setDevisDemandeViewType: (view: DevisDemandeViewType) => void;
  setDevisViewType: (view: DevisViewType) => void;
  setFactureViewType: (view: FactureViewType) => void;
  setDocumentViewType: (view: DocumentViewType) => void;
  setCalendarViewType: (view: CalendarViewType) => void;
  setCalendarSlotMinTime: (time: string) => void;
  setCalendarSlotMaxTime: (time: string) => void;
  setCalendarSlotDuration: (duration: CalendarSlotDurationType) => void;
  setCalendarSelectedClientIds: (ids: string[]) => void;
  setCalendarSelectedSiteIds: (ids: string[]) => void;
  setCalendarSelectedServiceIds: (ids: string[]) => void;
};

export const useUiStore = create<UiStoreType>()(
  persist(
    (set) => ({
      // default state
      TicketViewType: "list",
      PrestationViewType: "list",
      EntrepriseViewType: "list",
      DevisDemandeViewType: "list",
      DevisViewType: "list",
      FactureViewType: "list",
      DocumentViewType: "grid",
      CalendarViewType: "timeGridDay",
      CalendarSlotMinTime: "06:00:00",
      CalendarSlotMaxTime: "20:00:00",
      CalendarSlotDuration: "00:15:00",
      CalendarSelectedClientIds: [],
      CalendarSelectedSiteIds: [],
      CalendarSelectedServiceIds: [],

      // actions
      setTicketViewType: (view) => set({ TicketViewType: view }),
      setPrestationViewType: (view) => set({ PrestationViewType: view }),
      setEntrepriseViewType: (view) => set({ EntrepriseViewType: view }),
      setDevisDemandeViewType: (view) => set({ DevisDemandeViewType: view }),
      setDevisViewType: (view) => set({ DevisViewType: view }),
      setFactureViewType: (view) => set({ FactureViewType: view }),
      setDocumentViewType: (view) => set({ DocumentViewType: view }),
      setCalendarViewType: (view) => set({ CalendarViewType: view }),
      setCalendarSlotMinTime: (time) => set({ CalendarSlotMinTime: time }),
      setCalendarSlotMaxTime: (time) => set({ CalendarSlotMaxTime: time }),
      setCalendarSlotDuration: (duration) =>
        set({ CalendarSlotDuration: duration }),
      setCalendarSelectedClientIds: (ids) =>
        set({ CalendarSelectedClientIds: ids }),
      setCalendarSelectedSiteIds: (ids) =>
        set({ CalendarSelectedSiteIds: ids }),
      setCalendarSelectedServiceIds: (ids) =>
        set({ CalendarSelectedServiceIds: ids }),
    }),
    {
      name: UI_STORE_KEY,
      partialize: (state) => ({
        TicketViewType: state.TicketViewType,
        PrestationViewType: state.PrestationViewType,
        EntrepriseViewType: state.EntrepriseViewType,
        DevisDemandeViewType: state.DevisDemandeViewType,
        DevisViewType: state.DevisViewType,
        FactureViewType: state.FactureViewType,
        DocumentViewType: state.DocumentViewType,
        CalendarViewType: state.CalendarViewType,
        CalendarSlotMinTime: state.CalendarSlotMinTime,
        CalendarSlotMaxTime: state.CalendarSlotMaxTime,
        CalendarSlotDuration: state.CalendarSlotDuration,
        CalendarSelectedClientIds: state.CalendarSelectedClientIds,
        CalendarSelectedSiteIds: state.CalendarSelectedSiteIds,
        CalendarSelectedServiceIds: state.CalendarSelectedServiceIds,
      }),
    },
  ),
);
