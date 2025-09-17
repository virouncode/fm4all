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
        //initial state
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

/*

const type MyStore = {
  value1:string;
  value2:number;
  setValue1: (value: string) => void;
  setValue2: (value: number) => void;
  reinitialize: () => void;
}
const useMyStore = create<MyStore>()((set)=>({
  //State
  value1: "", // initial state
  value2: 0,  // initialState


  //Actions
  setValue1: (value) => set({ value1: value }),
  setValue2: (value) => set({ value2: value }),
  reinitialize: () => set({ value1: "", value2: 0 }),
}))
 
Comme un setState classique la fonction set prend en argument un objet partiel du state ou une fonction qui prend en argument le state et qui retourne un objet partiel du state. On aurait pu écrite aussi :
  setValue1: (value) => set(() => ({ value1: value })),
  setValue2: (value) => set(() => ({ value2: value })),
  reinitialize: () => set(() => ({ value1: "", value2: 0 })),
leA
En plus la fonction set merge le state (attention à un seul niveau, pas de nested merge) donc pas besoin d'utiliser le spread operator.
*/
