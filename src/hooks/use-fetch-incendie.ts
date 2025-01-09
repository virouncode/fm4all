import { ClientContext } from "@/context/ClientProvider";
import { roundSurface } from "@/lib/roundSurface";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { useContext, useEffect, useState } from "react";
import { useToast } from "./use-toast";

const useFetchIncendie = () => {
  const { toast } = useToast();
  const { client } = useContext(ClientContext);

  const [incendieQuantites, setIncendieQuantites] =
    useState<SelectIncendieQuantitesType | null>(null);
  const [incendieTarifs, setIncendieTarifs] = useState<
    (SelectIncendieTarifsType & {
      prixParExtincteur: number;
      prixParBaes: number;
      prixParTelBaes: number;
      fraisDeplacement: number;
    })[]
  >([]);

  useEffect(() => {
    const fetchIncendie = async () => {
      if (!client?.surface) return;
      const roundedSurface = roundSurface(client.surface);
      try {
        const [incendieQuantitesResponse, incendieTarifsResponse] =
          await Promise.all([
            fetch(`/api/incendie/quantites?surface=${roundedSurface}`),
            fetch(`/api/incendie/tarifs?surface=${roundedSurface}`),
          ]);

        if (!incendieQuantitesResponse.ok || !incendieTarifsResponse.ok) {
          throw new Error("Erreur réseau");
        }
        const incendieQuantitesJson = await incendieQuantitesResponse.json();
        const incendieTarifsJson = await incendieTarifsResponse.json();

        if (!incendieQuantitesJson.success || !incendieTarifsJson.success) {
          throw new Error(
            incendieQuantitesJson.error.message ||
              incendieTarifsJson.error.message
          );
        }
        setIncendieQuantites(incendieQuantitesJson.data);
        setIncendieTarifs(incendieTarifsJson.data);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: "Error",
            description: err.message,
          });
        }
      }
    };
    fetchIncendie();
  }, [client.surface, toast]);
  return {
    incendieQuantites,
    incendieTarifs,
  };
};

export default useFetchIncendie;
