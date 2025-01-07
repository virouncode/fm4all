import {
  getPropreteConsoTarifs,
  getPropreteDistribQuantites,
  getPropreteDistribTarifs,
  getPropreteInstalDistribTarifs,
} from "@/actions/getProprete";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectPropreteConsoTarifsType } from "@/zod-schemas/propreteConsoTarifs";
import { SelectPropreteDistribQuantiteType } from "@/zod-schemas/propreteDistribQuantite";
import { SelectPropreteDistribTarifsType } from "@/zod-schemas/propreteDistribTarifs";
import { SelectPropreteInstalDistribTarifsType } from "@/zod-schemas/propreteInstalDistribTarifs";
import { useContext, useEffect, useState } from "react";

const useFetchProprete = () => {
  const { devisData, setDevisData } = useContext(DevisDataContext);
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
  const devisDataFournisseurId =
    devisData.services.nettoyage.propreteFournisseurId;
  const devisDataEffectif = devisData.firstCompanyInfo.effectif;

  useEffect(() => {
    const fetchProprete = async () => {
      if (!devisDataFournisseurId || !devisDataEffectif) return;
      const roundedEffectif = roundEffectif(parseInt(devisDataEffectif));
      try {
        const results = await Promise.all([
          getPropreteDistribQuantites(roundedEffectif),
          getPropreteDistribTarifs(devisDataFournisseurId as number),
          getPropreteInstalDistribTarifs(
            roundedEffectif,
            devisDataFournisseurId as number
          ),
          getPropreteConsoTarifs(
            roundedEffectif,
            devisDataFournisseurId as number
          ),
        ]);
        setDistribQuantites(results[0]);
        setDistribTarifs(results[1]);
        setDistribInstalTarifs(results[2]);
        setConsoTarifs(results[3]);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    };
    fetchProprete();
  }, [devisDataFournisseurId, devisDataEffectif]);
  return {
    distribQuantites,
    distribTarifs,
    distribInstalTarifs,
    consoTarifs,
  };
};

export default useFetchProprete;
