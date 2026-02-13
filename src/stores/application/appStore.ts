"use client";

import {
  EntrepriseSelectType,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import { create } from "zustand";

export type AppUser = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  avatarId?: string | null;
};

export type BootstrapPayload = {
  user: AppUser;
  entreprise: EntrepriseSelectType;
  roleAdhesion: RoleAdhesionType;
  rolesEntreprise: RoleEntrepriseType[];
  postureActive: RoleEntrepriseType;
  rolePlateformeAdhesion: RolePlateformeAdhesionType | null;
};

type AppStore = {
  // state
  user: AppUser | null;
  entreprise: EntrepriseSelectType | null;
  roleAdhesion: RoleAdhesionType | null;
  rolesEntreprise: RoleEntrepriseType[];
  postureActive: RoleEntrepriseType | null;
  rolePlateformeAdhesion: RolePlateformeAdhesionType | null;

  // actions
  hydrate: (payload: BootstrapPayload) => void;
  setPostureActive: (posture: RoleEntrepriseType) => void;
  updateUser: (user: AppUser) => void;
  reset: () => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  entreprise: null,
  roleAdhesion: null,
  rolesEntreprise: [],
  postureActive: null,
  rolePlateformeAdhesion: null,

  hydrate: (payload) =>
    set({
      user: payload.user,
      entreprise: payload.entreprise,
      roleAdhesion: payload.roleAdhesion,
      rolesEntreprise: payload.rolesEntreprise,
      postureActive: payload.postureActive,
      rolePlateformeAdhesion: payload.rolePlateformeAdhesion,
    }),

  setPostureActive: (posture) => {
    const roles = get().rolesEntreprise;
    if (!roles.includes(posture)) return; // invariant
    set({ postureActive: posture });
  },

  updateUser: (user) => set({ user }),

  reset: () =>
    set({
      user: null,
      entreprise: null,
      roleAdhesion: null,
      rolesEntreprise: [],
      postureActive: null,
      rolePlateformeAdhesion: null,
    }),
}));
