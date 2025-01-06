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
  const { devisData } = useContext(DevisDataContext);
  const [distribQuantites, setDistribQuantites] = useState<
    | (SelectPropreteDistribQuantiteType & {
        nb_distrib_desinfectant: number;
        nb_distrib_parfum: number;
        nb_distrib_balai: number;
        nb_distrib_poubelle: number;
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
      if (
        !devisData.services.nettoyage.propreteFournisseurId ||
        !devisData.firstCompanyInfo.effectif
      )
        return;
      console.log(
        "fetchProprete forunissuerId",
        devisData.services.nettoyage.propreteFournisseurId
      );

      try {
        const results = await Promise.all([
          getPropreteDistribQuantites(
            roundEffectif(parseInt(devisData.firstCompanyInfo.effectif))
          ),
          getPropreteDistribTarifs(
            devisData.services.nettoyage.propreteFournisseurId as number
          ),
          getPropreteInstalDistribTarifs(
            roundEffectif(parseInt(devisData.firstCompanyInfo.effectif)),
            devisData.services.nettoyage.propreteFournisseurId as number
          ),
          getPropreteConsoTarifs(
            roundEffectif(parseInt(devisData.firstCompanyInfo.effectif)),
            devisData.services.nettoyage.propreteFournisseurId as number
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
  }, [
    devisData.firstCompanyInfo.effectif,
    devisData.services.nettoyage.propreteFournisseurId,
  ]);
  return {
    distribQuantites,
    distribTarifs,
    distribInstalTarifs,
    consoTarifs,
  };
};

export default useFetchProprete;
