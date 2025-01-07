import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { roundSurface } from "@/lib/roundSurface";
import { SelectNettoyageRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectNettoyageVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { useContext, useEffect, useState } from "react";
import { useToast } from "./use-toast";

const useFetchNettoyage = () => {
  const { toast } = useToast();
  const { companyInfo } = useContext(CompanyInfoContext);
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
      const roundedSurface = roundSurface(parseInt(companyInfo.surface));
      try {
        const [nettoyageResponse, repasseResponse, vitrerieResponse] =
          await Promise.all([
            fetch(
              `/api/nettoyage/services/propositions?surface=${roundedSurface}`
            ),
            fetch(
              `/api/nettoyage/repasse/propositions?surface=${roundedSurface}`
            ),
            fetch(
              `/api/nettoyage/vitrerie/propositions?surface=${roundedSurface}`
            ),
          ]);

        if (
          !nettoyageResponse.ok ||
          !repasseResponse.ok ||
          !vitrerieResponse.ok
        ) {
          throw new Error("Erreur réseau");
        }
        const nettoyageJson = await nettoyageResponse.json();
        const repasseJson = await repasseResponse.json();
        const vitrerieJson = await vitrerieResponse.json();

        if (
          !nettoyageJson.success ||
          !repasseJson.success ||
          !vitrerieJson.success
        ) {
          throw new Error(
            nettoyageJson.error.message ||
              repasseJson.error.message ||
              vitrerieJson.error.message
          );
        }
        setNettoyagePropositions(nettoyageJson.data);
        setRepassePropositions(repasseJson.data);
        setVitreriePropositions(vitrerieJson.data);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: "Error",
            description: err.message,
          });
        }
      }
    };
    fetchPropositions();
  }, [companyInfo.surface, toast]);

  return { nettoyagePropositions, repassePropositions, vitreriePropositions };
};

export default useFetchNettoyage;
