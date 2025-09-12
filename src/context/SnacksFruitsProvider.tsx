"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const SnacksFruitsContext = createContext<{
  snacksFruits: SnacksFruitsType;
  setSnacksFruits: Dispatch<SetStateAction<SnacksFruitsType>>;
}>({
  snacksFruits: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      isSameFournisseur: false,
      gammeSelected: null,
      choix: ["fruits"],
      commentaires: null,
    },
    quantites: {
      nbPersonnes: 0,
      fruitsKgParSemaine: 0,
      snacksPortionsParSemaine: 0,
      boissonsConsosParSemaine: 0,
    },
    prix: {
      prixKgFruits: null,
      prixUnitaireSnacks: null,
      prixUnitaireBoissons: null,
      prixUnitaireLivraisonSiCafe: null,
      prixUnitaireLivraison: null,
      seuilFranco: null,
      panierMin: null,
    },
  },
  setSnacksFruits: () => {},
});

const SnacksFruitsProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const client = useClientStore((s) => s.client);

  // Always initialize state
  const [snacksFruits, setSnacksFruits] = useState<SnacksFruitsType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      isSameFournisseur: false,
      gammeSelected: null,
      choix: ["fruits"],
      commentaires: null,
    },
    quantites: {
      nbPersonnes: client.effectif ?? 0,
      fruitsKgParSemaine: 0,
      snacksPortionsParSemaine: 0,
      boissonsConsosParSemaine: 0,
    },
    prix: {
      prixKgFruits: null,
      prixUnitaireSnacks: null,
      prixUnitaireBoissons: null,
      prixUnitaireLivraisonSiCafe: null,
      prixUnitaireLivraison: null,
      seuilFranco: null,
      panierMin: null,
    },
  });

  useEffect(() => {
    if (isMounted) {
      const storedSnacksFruits = localStorage.getItem("snacksFruits");
      if (storedSnacksFruits) {
        setSnacksFruits(JSON.parse(storedSnacksFruits));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("snacksFruits", JSON.stringify(snacksFruits));
    }
  }, [snacksFruits, isMounted]);

  if (!isMounted) return null;

  return (
    <SnacksFruitsContext.Provider value={{ snacksFruits, setSnacksFruits }}>
      {children}
    </SnacksFruitsContext.Provider>
  );
};

export default SnacksFruitsProvider;
