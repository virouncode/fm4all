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

  const updateHygieneContext = useCallback(
    (data: CacheInvalidationData) => {
      if (data.serviceType !== "hygiene") return;
      const tarifType = data.tarifType as string;
      const clientEffectifRounded = roundEffectif(client.effectif);
      console.log(
        `Mise à jour du contexte hygiene (${tarifType}): ${data.field} -> ${data.value}`
      );

      switch (tarifType) {
        case "distributeurs": //TODO distributeurs OPTIONS
          const distributeurType =
            data.distributeurType as TrilogieDistributeurType;
          if (hygiene.infos.fournisseurId === data.fournisseurId) {
            if (
              hygiene.infos.trilogieGammeSelected &&
              (data.distributeurType === "emp" ||
                data.distributeurType === "poubelleEmp" ||
                data.distributeurType === "ph" ||
                data.distributeurType === "savon") &&
              hygiene.infos.dureeLocation === data.field
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
              //Calcul de TotalHygiene
              const prixDistribEmp =
                distributeurType === "emp"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribEmp;
              const prixDistribEmpPoubelle =
                distributeurType === "poubelleEmp"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribEmpPoubelle;
              const prixDistribSavon =
                distributeurType === "savon"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribSavon;
              const prixDistribPh =
                distributeurType === "ph"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribPh;
              const nbDistribEmp = hygiene.quantites.nbDistribEmp;
              const nbDistribEmpPoubelle =
                hygiene.quantites.nbDistribEmpPoubelle;
              const nbDistribSavon = hygiene.quantites.nbDistribSavon;
              const nbDistribPh = hygiene.quantites.nbDistribPh;

              const paParPersonneEmp = hygiene.prix.paParPersonneEmp;
              const paParPersonneSavon = hygiene.prix.paParPersonneSavon;
              const paParPersonnePh = hygiene.prix.paParPersonnePh;
              const minFacturation = hygiene.prix.minFacturation;

              const totalEmp =
                nbDistribEmp !== null &&
                prixDistribEmp !== null &&
                paParPersonneEmp !== null
                  ? nbDistribEmp * prixDistribEmp +
                    paParPersonneEmp * client.effectif
                  : 0;

              const totalPoubelleEmp =
                nbDistribEmpPoubelle !== null && prixDistribEmpPoubelle !== null
                  ? nbDistribEmpPoubelle * prixDistribEmpPoubelle
                  : 0;

              const totalSavon =
                nbDistribSavon &&
                prixDistribSavon !== null &&
                paParPersonneSavon !== null
                  ? nbDistribSavon * prixDistribSavon +
                    paParPersonneSavon * client.effectif
                  : 0;

              const totalPh =
                nbDistribPh &&
                prixDistribPh !== null &&
                paParPersonnePh !== null
                  ? nbDistribPh * prixDistribPh +
                    paParPersonnePh * client.effectif
                  : 0;

              const totalAnnuelTrilogie =
                totalEmp === null &&
                totalPoubelleEmp === null &&
                totalSavon === null &&
                totalPh === null
                  ? null
                  : Math.max(
                      (totalEmp ?? 0) +
                        (totalPoubelleEmp ?? 0) +
                        (totalSavon ?? 0) +
                        (totalPh ?? 0),
                      minFacturation ?? 0
                    );
              setTotalHygiene((prev) => ({
                ...prev,
                totalTrilogie: totalAnnuelTrilogie,
              }));
              toast({
                title: t("tarifs-mis-a-jour"),
                description: t(
                  "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                  { nomFournisseur: hygiene.infos.nomFournisseur || "" }
                ),
                duration: 4000,
              });
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
          if (
            hygiene.infos.fournisseurId === data.fournisseurId &&
            hygiene.infos.trilogieGammeSelected
          ) {
            setHygiene((prev) => ({
              ...prev,
              prix: {
                ...prev.prix,
                prixInstalDistrib: data.value as number,
              },
            }));
            //Calcul total installation
            setTotalHygiene((prev) => ({
              ...prev,
              totalInstallation: data.value as number,
            }));
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
        case "consommables":
          if (clientEffectifRounded === data.effectif) {
            if (
              hygiene.infos.fournisseurId === data.fournisseurId &&
              hygiene.infos.trilogieGammeSelected
            ) {
              setHygiene((prev) => ({
                ...prev,
                prix: {
                  ...prev.prix,
                  [data.field as string]: data.value as number,
                },
              }));
              //Calcul de TotalHygiene
            } else {
              toast({
                title: t("tarifs-mis-a-jour"),
                description: t(
                  "les-tarifs-ont-ete-mis-a-jour-par-un-fournisseur-la-page-a-ete-rechargee"
                ),
                duration: 3000,
              });
            }
          }
          return;
        default:
          return;
      }
    },
    [
      client.effectif,
      hygiene.infos.dureeLocation,
      hygiene.infos.fournisseurId,
      hygiene.infos.nomFournisseur,
      hygiene.infos.trilogieGammeSelected,
      hygiene.prix.minFacturation,
      hygiene.prix.paParPersonneEmp,
      hygiene.prix.paParPersonnePh,
      hygiene.prix.paParPersonneSavon,
      hygiene.prix.prixDistribEmp,
      hygiene.prix.prixDistribEmpPoubelle,
      hygiene.prix.prixDistribPh,
      hygiene.prix.prixDistribSavon,
      hygiene.quantites.nbDistribEmp,
      hygiene.quantites.nbDistribEmpPoubelle,
      hygiene.quantites.nbDistribPh,
      hygiene.quantites.nbDistribSavon,
      setHygiene,
      setTotalHygiene,
      t,
      toast,
    ]
  );

  return updateHygieneContext;
}
