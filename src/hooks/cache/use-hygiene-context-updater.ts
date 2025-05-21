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

type DistributeurType =
  | "emp"
  | "poubelleEmp"
  | "savon"
  | "ph"
  | "desinfectant"
  | "parfum"
  | "balai"
  | "poubelle";

export function useHygieneContextUpdater() {
  const t = useTranslations("DevisPage");
  const { toast } = useToast();
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { totalHygiene, setTotalHygiene } = useContext(TotalHygieneContext);
  const { client } = useContext(ClientContext);

  const updateHygieneContext = useCallback(
    (data: CacheInvalidationData) => {
      if (data.serviceType !== "hygiene") return;
      const tarifType = data.tarifType as string;
      const clientEffectifRounded = roundEffectif(client.effectif);
      console.log(
        "mes datas",
        data,
        hygiene.infos.fournisseurId === data.fournisseurId
      );

      switch (tarifType) {
        case "distributeurs":
          const distributeurType = data.distributeurType as DistributeurType;
          if (hygiene.infos.fournisseurId === data.fournisseurId) {
            console.log("checkPoint3");
            if (
              hygiene.infos.trilogieGammeSelected &&
              hygiene.infos.dureeLocation === data.field
            ) {
              console.log("checkPoint4");
              setHygiene((prev) => ({
                ...prev,
                prix: {
                  ...prev.prix,
                  [distribPrixMapping[
                    data.distributeurType as DistributeurType
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
              const prixDistribDesinfectant =
                distributeurType === "desinfectant"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribDesinfectant;
              const prixDistribParfum =
                distributeurType === "parfum"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribParfum;
              const prixDistribBalai =
                distributeurType === "balai"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribBalai;
              const prixDistribPoubelle =
                distributeurType === "poubelle"
                  ? (data.value as number)
                  : hygiene.prix.prixDistribPoubelle;

              const nbDistribEmp = hygiene.quantites.nbDistribEmp;
              const nbDistribEmpPoubelle =
                hygiene.quantites.nbDistribEmpPoubelle;
              const nbDistribSavon = hygiene.quantites.nbDistribSavon;
              const nbDistribPh = hygiene.quantites.nbDistribPh;
              const nbDistribDesinfectant =
                hygiene.quantites.nbDistribDesinfectant;
              const nbDistribParfum = hygiene.quantites.nbDistribParfum;
              const nbDistribBalai = hygiene.quantites.nbDistribBalai;
              const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle;

              const paParPersonneEmp = hygiene.prix.paParPersonneEmp;
              const paParPersonneSavon = hygiene.prix.paParPersonneSavon;
              const paParPersonnePh = hygiene.prix.paParPersonnePh;
              const paParPersonneDesinfectant =
                hygiene.prix.paParPersonneDesinfectant;
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

              const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
                ? nbDistribDesinfectant &&
                  prixDistribDesinfectant !== null &&
                  paParPersonneDesinfectant !== null
                  ? nbDistribDesinfectant * prixDistribDesinfectant +
                    paParPersonneDesinfectant * client.effectif
                  : 0
                : null;
              const totalParfum = hygiene.infos.parfumGammeSelected
                ? nbDistribParfum && prixDistribParfum !== null
                  ? nbDistribParfum * prixDistribParfum
                  : 0
                : null;
              const totalBalai = hygiene.infos.balaiGammeSelected
                ? nbDistribBalai && prixDistribBalai !== null
                  ? nbDistribBalai * prixDistribBalai
                  : 0
                : null;
              const totalPoubelle = hygiene.infos.poubelleGammeSelected
                ? nbDistribPoubelle && prixDistribPoubelle !== null
                  ? nbDistribPoubelle * prixDistribPoubelle
                  : 0
                : null;
              setTotalHygiene((prev) => ({
                ...prev,
                totalTrilogie: totalAnnuelTrilogie,
                totalDesinfectant,
                totalParfum,
                totalBalai,
                totalPoubelle,
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
              const prixDistribEmp = hygiene.prix.prixDistribEmp ?? 0;
              const prixDistribEmpPoubelle =
                hygiene.prix.prixDistribEmpPoubelle ?? 0;
              const prixDistribSavon = hygiene.prix.prixDistribSavon ?? 0;
              const prixDistribPh = hygiene.prix.prixDistribPh ?? 0;
              const prixDistribDesinfectant =
                hygiene.prix.prixDistribDesinfectant ?? 0;
              const prixDistribParfum = hygiene.prix.prixDistribParfum ?? 0;
              const prixDistribBalai = hygiene.prix.prixDistribBalai ?? 0;
              const prixDistribPoubelle = hygiene.prix.prixDistribPoubelle ?? 0;
              const nbDistribEmp = hygiene.quantites.nbDistribEmp;
              const nbDistribEmpPoubelle =
                hygiene.quantites.nbDistribEmpPoubelle;
              const nbDistribSavon = hygiene.quantites.nbDistribSavon;
              const nbDistribPh = hygiene.quantites.nbDistribPh;
              const nbDistribDesinfectant =
                hygiene.quantites.nbDistribDesinfectant;
              const nbDistribParfum = hygiene.quantites.nbDistribParfum;
              const nbDistribBalai = hygiene.quantites.nbDistribBalai;
              const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle;
              const paParPersonneEmp =
                data.field === "paParPersonneEmp"
                  ? (data.value as number)
                  : hygiene.prix.paParPersonneEmp;
              const paParPersonneSavon =
                data.field === "paParPersonneSavon"
                  ? (data.value as number)
                  : hygiene.prix.paParPersonneSavon;
              const paParPersonnePh =
                data.field === "paParPersonnePh"
                  ? (data.value as number)
                  : hygiene.prix.paParPersonnePh;
              const paParPersonneDesinfectant =
                data.field === "paParPersonneDesinfectant"
                  ? (data.value as number)
                  : hygiene.prix.paParPersonneDesinfectant;
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
              const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
                ? nbDistribDesinfectant &&
                  prixDistribDesinfectant !== null &&
                  paParPersonneDesinfectant !== null
                  ? nbDistribDesinfectant * prixDistribDesinfectant +
                    paParPersonneDesinfectant * client.effectif
                  : 0
                : null;
              const totalParfum = hygiene.infos.parfumGammeSelected
                ? nbDistribParfum && prixDistribParfum !== null
                  ? nbDistribParfum * prixDistribParfum
                  : 0
                : null;
              const totalBalai = hygiene.infos.balaiGammeSelected
                ? nbDistribBalai && prixDistribBalai !== null
                  ? nbDistribBalai * prixDistribBalai
                  : 0
                : null;
              const totalPoubelle = hygiene.infos.poubelleGammeSelected
                ? nbDistribPoubelle && prixDistribPoubelle !== null
                  ? nbDistribPoubelle * prixDistribPoubelle
                  : 0
                : null;
              setTotalHygiene((prev) => ({
                ...prev,
                totalTrilogie: totalAnnuelTrilogie,
                totalDesinfectant,
                totalParfum,
                totalBalai,
                totalPoubelle,
              }));
              toast({
                title: t("tarifs-mis-a-jour"),
                description: t(
                  "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                  { nomFournisseur: hygiene.infos.nomFournisseur || "" }
                ),
                duration: 4000,
              });
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
        case "minFacturation":
          console.log("checkPoint4", data);
          if (
            hygiene.infos.fournisseurId === data.fournisseurId &&
            hygiene.infos.trilogieGammeSelected
          ) {
            console.log("checkPoint5", data);

            setHygiene((prev) => ({
              ...prev,
              prix: {
                ...prev.prix,
                minFacturation: data.value as number,
              },
            }));
            //Comparaison de total hygiene avec data.value
            if (data.value && totalHygiene.totalTrilogie) {
              if (totalHygiene.totalTrilogie < (data.value as number)) {
                setTotalHygiene((prev) => ({
                  ...prev,
                  totalTrilogie: data.value as number,
                }));
              }
            }
            toast({
              title: t("tarifs-mis-a-jour"),
              description: t(
                "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                { nomFournisseur: hygiene.infos.nomFournisseur || "" }
              ),
              duration: 4000,
            });
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
        default:
          return;
      }
    },
    [
      client.effectif,
      hygiene.infos.balaiGammeSelected,
      hygiene.infos.desinfectantGammeSelected,
      hygiene.infos.dureeLocation,
      hygiene.infos.fournisseurId,
      hygiene.infos.nomFournisseur,
      hygiene.infos.parfumGammeSelected,
      hygiene.infos.poubelleGammeSelected,
      hygiene.infos.trilogieGammeSelected,
      hygiene.prix.minFacturation,
      hygiene.prix.paParPersonneDesinfectant,
      hygiene.prix.paParPersonneEmp,
      hygiene.prix.paParPersonnePh,
      hygiene.prix.paParPersonneSavon,
      hygiene.prix.prixDistribBalai,
      hygiene.prix.prixDistribDesinfectant,
      hygiene.prix.prixDistribEmp,
      hygiene.prix.prixDistribEmpPoubelle,
      hygiene.prix.prixDistribParfum,
      hygiene.prix.prixDistribPh,
      hygiene.prix.prixDistribPoubelle,
      hygiene.prix.prixDistribSavon,
      hygiene.quantites.nbDistribBalai,
      hygiene.quantites.nbDistribDesinfectant,
      hygiene.quantites.nbDistribEmp,
      hygiene.quantites.nbDistribEmpPoubelle,
      hygiene.quantites.nbDistribParfum,
      hygiene.quantites.nbDistribPh,
      hygiene.quantites.nbDistribPoubelle,
      hygiene.quantites.nbDistribSavon,
      setHygiene,
      setTotalHygiene,
      t,
      toast,
      totalHygiene.totalTrilogie,
    ]
  );

  return updateHygieneContext;
}
