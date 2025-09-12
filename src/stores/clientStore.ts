"use client";

import { InsertClientType } from "@/zod-schemas/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ClientStore = {
  client: InsertClientType;
  setClient: (
    value: InsertClientType | ((prev: InsertClientType) => InsertClientType),
  ) => void;
};

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      client: {
        nomEntreprise: "",
        siret: null,
        prenomContact: "",
        nomContact: "",
        posteContact: "",
        emailContact: "",
        phoneContact: "",
        prenomSignataire: null,
        nomSignataire: null,
        posteSignataire: null,
        emailSignataire: null,
        surface: 100,
        effectif: 20,
        typeBatiment: "bureaux",
        typeOccupation: "partieEtage",
        adresseLigne1: null,
        adresseLigne2: null,
        codePostal: "",
        ville: "",
        dateDeDemarrage: null,
        commentaires: null,
      },
      setClient: (value) =>
        set((state) => ({
          client: typeof value === "function" ? value(state.client) : value,
        })),
    }),
    { name: "client" },
  ),
);
