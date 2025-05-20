import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { CacheInvalidationData } from "@/lib/cache-invalidation";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { useTranslations } from "next-intl";
import { useCallback, useContext } from "react";
import { useToast } from "../use-toast";

//ATTENTION A EPCH !!!!!!!!
const distribPrixMapping = {
  emp: "prixDistribEmp",
  poubelleEmp: "prixDistribEmpPoubelle",
  savon: "prixDistribSavon",
  ph: "prixDistribPh",
  desinfectant: "prixDistribDesinfectant",
  parfum: "prixDistribParfum",
  balai: "prixDistribBalai",
  poubelle: "prixDistribPoubelle",
};

type TrilogieDistributeurType = "emp" | "poubelleEmp" | "savon" | "ph";

export function useHygieneContextUpdater() {
  const t = useTranslations("DevisPage");
  const { toast } = useToast();
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { client } = useContext(ClientContext);

  const updateHygieneContext = useCallback((data: CacheInvalidationData) => {
    if (data.serviceType !== "hygiene") return;
    const tarifType = data.tarifType as string;
    const clientEffectifRounded = roundEffectif(client.effectif);
    console.log(
      `Mise à jour du contexte hygiene (${tarifType}): ${data.field} -> ${data.value}`
    );

    switch (tarifType) {
      case "distributeurs":
        if (hygiene.infos.fournisseurId === data.fournisseurId) {
          if (
            hygiene.infos.trilogieGammeSelected &&
            (data.distributeurType === "emp" ||
              data.distributeurType === "poubelleEmp" ||
              data.distributeurType === "ph" ||
              data.distributeurType === "savon") &&
            (hygiene.infos.dureeLocation === data.field ||
              data.field === "minFacturation")
          ) {
            setHygiene((prev) => ({
              ...prev,
              prix: {
                ...prev.prix,
                [distribPrixMapping[
                  data.distributeurType as TrilogieDistributeurType
                ]]: data.value,
              },
            }));
          }
        } else {
          toast({
            title: t("tarifs-mis-a-jour"),
            description: t(
              "les-tarifs-ont-ete-mis-a-jour-par-un-fournisseur-la-page-a-ete-rechargee"
            ),
            duration: 3000,
          });
        }
        return;
      case "installation":
        return;
      case "consommables":
        return;
      default:
        return;
    }
  }, []);
}
