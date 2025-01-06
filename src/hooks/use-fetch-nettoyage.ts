import {
  getNettoyagePropositions,
  getNettoyageRepassePropositions,
  getNettoyageVitreriePropositions,
} from "@/actions/getNettoyage";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { roundSurface } from "@/lib/roundSurface";
import { SelectNettoyageRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectNettoyageVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { useContext, useEffect, useState } from "react";

const useFetchNettoyage = () => {
  const { devisData } = useContext(DevisDataContext);
  const [nettoyagePropositions, setNettoyagePropositions] = useState<
    (SelectNettoyageTarifsType & {
      prixAnnuel: number;
      freqAnnuelle: number;
      prixAnnuelSamedi: number;
      prixAnnuelDimanche: number;
    })[]
  >([]);
  const [repassePropositions, setRepassePropositions] = useState<
    (SelectNettoyageRepasseTarifsType & {
      prixAnnuel: number;
      freqAnnuelle: number;
    })[]
  >([]);
  const [vitreriePropositions, setVitreriePropositions] = useState<
    (SelectNettoyageVitrerieTarifsType & {
      prixVitrerieParPassage: number;
      prixCloisonsParPassage: number;
    })[]
  >([]);
  useEffect(() => {
    const fetchPropositions = async () => {
      try {
        const results = await Promise.all([
          getNettoyagePropositions(
            roundSurface(parseInt(devisData.firstCompanyInfo.surface))
          ),
          getNettoyageRepassePropositions(
            roundSurface(parseInt(devisData.firstCompanyInfo.surface))
          ),
          getNettoyageVitreriePropositions(
            roundSurface(parseInt(devisData.firstCompanyInfo.surface))
          ),
        ]);
        setNettoyagePropositions(results[0]);
        setRepassePropositions(results[1]);
        setVitreriePropositions(results[2]);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    };
    fetchPropositions();
  }, [devisData.firstCompanyInfo.surface]);
  return { nettoyagePropositions, repassePropositions, vitreriePropositions };
};

export default useFetchNettoyage;
