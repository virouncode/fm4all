"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import {
  InsertProspectType,
  SelectProspectType,
} from "@/zod-schemas/prospect.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type ProspectStore = {
  prospect: InsertProspectType & { id?: string };
  setProspect: (
    value:
      | (InsertProspectType & { id?: string })
      | ((
          prev: InsertProspectType & { id?: string },
        ) => InsertProspectType & { id?: string }),
  ) => void;
  reset: () => void;
};

const initialProspect: InsertProspectType & { id?: string } = {
  nomEntreprise: "",
  prenomContact: "",
  nomContact: "",
  posteContact: "",
  emailContact: "",
  phoneContact: "",
  surface: 100,
  effectif: 20,
  typeBatiment: "bureaux",
  typeOccupation: "partieEtage",
  codePostal: "",
  ville: "",
  siret: null,
  prenomSignataire: null,
  nomSignataire: null,
  posteSignataire: null,
  emailSignataire: null,
  adresseLigne1: null,
  adresseLigne2: null,
  dateDeDemarrage: null,
  commentaires: null,
};

const createProspectStore = (): StoreApi<ProspectStore> =>
  create<ProspectStore>()(
    persist(
      (set) => ({
        prospect: initialProspect,
        setProspect: (value) =>
          set((state) => ({
            prospect:
              typeof value === "function" ? value(state.prospect) : value,
          })),
        reset: () => set(() => ({ prospect: initialProspect })),
      }),
      { name: "prospect" },
    ),
  );

const ctx = createStoreContext<ProspectStore>(createProspectStore, "Prospect");

export const ProspectStoreProvider = ctx.Provider;
export const useProspectStore = ctx.useTypedStore;
export const useProspectStoreApi = ctx.useStoreApi;

export function toStoreProspect(
  prospect: SelectProspectType,
): InsertProspectType & { id: string } {
  return {
    id: prospect.id,
    nomEntreprise: prospect.nomEntreprise,
    prenomContact: prospect.prenomContact,
    nomContact: prospect.nomContact,
    posteContact: prospect.posteContact,
    emailContact: prospect.emailContact,
    phoneContact: prospect.phoneContact,
    surface: prospect.surface,
    effectif: prospect.effectif,
    typeBatiment: prospect.typeBatiment,
    typeOccupation: prospect.typeOccupation,
    codePostal: prospect.codePostal,
    ville: prospect.ville,
    siret: prospect.siret,
    prenomSignataire: prospect.prenomSignataire,
    nomSignataire: prospect.nomSignataire,
    posteSignataire: prospect.posteSignataire,
    emailSignataire: prospect.emailSignataire,
    adresseLigne1: prospect.adresseLigne1,
    adresseLigne2: prospect.adresseLigne2,
    dateDeDemarrage: prospect.dateDeDemarrage,
    commentaires: prospect.commentaires,
  };
}
