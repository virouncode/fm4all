import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { PropreteContext } from "@/context/PropreteProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectPropreteConsoTarifsType } from "@/zod-schemas/propreteConsoTarifs";
import { SelectPropreteDistribQuantiteType } from "@/zod-schemas/propreteDistribQuantite";
import { SelectPropreteDistribTarifsType } from "@/zod-schemas/propreteDistribTarifs";
import { SelectPropreteInstalDistribTarifsType } from "@/zod-schemas/propreteInstalDistribTarifs";
import { useContext, useEffect, useState } from "react";
import { useToast } from "./use-toast";

const useFetchProprete = () => {
  const { toast } = useToast();
  const { companyInfo } = useContext(CompanyInfoContext);
  const { proprete } = useContext(PropreteContext);

  const [distribQuantites, setDistribQuantites] = useState<
    | (SelectPropreteDistribQuantiteType & {
        nbDistribDesinfectant: number;
        nbDistribParfum: number;
        nbDistribBalai: number;
        nbDistribPoubelle: number;
      })
    | null
  >(null);
  const [distribTarifs, setDistribTarifs] = useState<
    SelectPropreteDistribTarifsType[]
  >([]);
  const [distribInstalTarifs, setDistribInstalTarifs] = useState<
    SelectPropreteInstalDistribTarifsType[]
  >([]);
  const [consoTarifs, setConsoTarifs] = useState<
    SelectPropreteConsoTarifsType[]
  >([]);

  useEffect(() => {
    const fetchProprete = async () => {
      const roundedEffectif = roundEffectif(parseInt(companyInfo.effectif));
      const fournisseurId = proprete.fournisseurId;
      if (!fournisseurId || !companyInfo.effectif) return;
      try {
        const [
          distribQuantitesResponse,
          distribTarifsResponse,
          distribInstalTarifsResponse,
          consoTarifsResponse,
        ] = await Promise.all([
          fetch(
            `/api/proprete/distributeurs/quantites?effectif=${roundedEffectif}`
          ),
          fetch(
            `/api/proprete/distributeurs/tarifs?fournisseurId=${fournisseurId}`
          ),
          fetch(
            `/api/proprete/distributeurs/installation?effectif=${roundedEffectif}&fournisseurId=${fournisseurId}&effectif=${roundedEffectif}`
          ),
          fetch(
            `/api/proprete/consommables/tarifs?effectif=${roundedEffectif}&fournisseurId=${fournisseurId}`
          ),
        ]);

        if (
          !distribQuantitesResponse.ok ||
          !distribTarifsResponse.ok ||
          !distribInstalTarifsResponse.ok ||
          !consoTarifsResponse.ok
        ) {
          throw new Error("Erreur réseau");
        }
        const distribQuantitesJson = await distribQuantitesResponse.json();
        const distribTarifsJson = await distribTarifsResponse.json();
        const distribInstalTarifsJson =
          await distribInstalTarifsResponse.json();
        const consoTarifsJson = await consoTarifsResponse.json();

        if (
          !distribQuantitesJson.success ||
          !distribTarifsJson.success ||
          !distribInstalTarifsJson.success ||
          !consoTarifsJson.success
        ) {
          throw new Error(
            distribQuantitesJson.error.message ||
              distribTarifsJson.error.message ||
              distribInstalTarifsJson.error.message ||
              consoTarifsJson.error.message
          );
        }

        setDistribQuantites(distribQuantitesJson.data);
        setDistribTarifs(distribTarifsJson.data);
        setDistribInstalTarifs(distribInstalTarifsJson.data);
        setConsoTarifs(consoTarifsJson.data);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: "Error",
            description: err.message,
          });
        }
      }
    };
    fetchProprete();
  }, [companyInfo.effectif, proprete.fournisseurId, toast]);
  return {
    distribQuantites,
    distribTarifs,
    distribInstalTarifs,
    consoTarifs,
  };
};

export default useFetchProprete;
