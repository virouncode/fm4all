import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantiteType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { useContext, useEffect, useState } from "react";
import { useToast } from "./use-toast";

const useFetchHygiene = () => {
  const { toast } = useToast();
  const { client } = useContext(ClientContext);
  const { hygiene } = useContext(HygieneContext);

  const [distribQuantites, setDistribQuantites] = useState<
    | (SelectHygieneDistribQuantiteType & {
        nbDistribDesinfectant: number;
        nbDistribParfum: number;
        nbDistribBalai: number;
        nbDistribPoubelle: number;
      })
    | null
  >(null);
  const [distribTarifs, setDistribTarifs] = useState<
    SelectHygieneDistribTarifsType[]
  >([]);
  const [distribInstalTarifs, setDistribInstalTarifs] = useState<
    SelectHygieneInstalDistribTarifsType[]
  >([]);
  const [consoTarifs, setConsoTarifs] = useState<
    SelectHygieneConsoTarifsType[]
  >([]);

  useEffect(() => {
    const fetchHygiene = async () => {
      if (!client.effectif || !hygiene.fournisseurId) return;
      const roundedEffectif = roundEffectif(client.effectif);
      const fournisseurId = hygiene.fournisseurId;
      if (!fournisseurId || !client.effectif) return;
      try {
        const [
          distribQuantitesResponse,
          distribTarifsResponse,
          distribInstalTarifsResponse,
          consoTarifsResponse,
        ] = await Promise.all([
          fetch(
            `/api/hygiene/distributeurs/quantites?effectif=${roundedEffectif}`
          ),
          fetch(
            `/api/hygiene/distributeurs/tarifs?fournisseurId=${fournisseurId}`
          ),
          fetch(
            `/api/hygiene/distributeurs/installation?effectif=${roundedEffectif}&fournisseurId=${fournisseurId}&effectif=${roundedEffectif}`
          ),
          fetch(
            `/api/hygiene/consommables/tarifs?effectif=${roundedEffectif}&fournisseurId=${fournisseurId}`
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
    fetchHygiene();
  }, [client.effectif, hygiene.fournisseurId, toast]);
  return {
    distribQuantites,
    distribTarifs,
    distribInstalTarifs,
    consoTarifs,
  };
};

export default useFetchHygiene;
