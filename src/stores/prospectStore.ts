"use client";

import { InsertProspectType } from "@/zod-schemas/prospect";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProspectStore = {
  prospect: InsertProspectType & { id?: number };
  setProspect: (
    value:
      | (InsertProspectType & { id?: number })
      | ((
          prev: InsertProspectType & { id?: number },
        ) => InsertProspectType & { id?: number }),
  ) => void;
  reset: () => void;
};

export const useProspectStore = create<ProspectStore>()(
  persist(
    (set) => ({
      prospect: {
        //initial state
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
      },
      setProspect: (value) =>
        set((state) => ({
          prospect: typeof value === "function" ? value(state.prospect) : value,
        })),
      reset: () =>
        set(() => ({
          prospect: {
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
          },
        })),
    }),
    { name: "prospect" },
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
