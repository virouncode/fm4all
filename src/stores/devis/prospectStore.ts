"use client";

import { InsertProspectType, SelectProspectType } from "@/zod-schemas/prospect.schema";
import { create } from "zustand";
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
