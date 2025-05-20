"use client";

import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { useToast } from "@/hooks/use-toast";
import { CacheInvalidationData } from "@/lib/cache-invalidation";
import { roundSurface } from "@/lib/utils/roundSurface";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { TotalNettoyageType } from "@/zod-schemas/total";
import { useTranslations } from "next-intl";
import { useCallback, useContext } from "react";

/**
 * Hook personnalisé pour mettre à jour le contexte nettoyage en fonction des données reçues via Pusher
 * Ce hook centralise la logique de mise à jour pour faciliter la maintenance et l'extension à d'autres services
 */
export function useNettoyageContextUpdater() {
  const t = useTranslations("DevisPage");
  const { toast } = useToast();
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { client } = useContext(ClientContext);

  const updateNettoyageContext = useCallback(
    (data: CacheInvalidationData) => {
      if (data.serviceType !== "nettoyage") return;
      const tarifType = data.tarifType as string;
      const clientSurfaceRounded = roundSurface(client.surface);
      console.log(
        `Mise à jour du contexte nettoyage (${tarifType}): ${data.field} -> ${data.value}`
      );

      switch (tarifType) {
        case "standard":
          if (clientSurfaceRounded === data.surface) {
            if (
              nettoyage.infos.fournisseurId === data.fournisseurId &&
              nettoyage.infos.gammeSelected === data.gamme
            ) {
              if (data.field === "hParPassage") {
                setNettoyage((prev: NettoyageType) => ({
                  ...prev,
                  quantites: {
                    ...prev.quantites,
                    hParPassage: data.value as number,
                  },
                }));
              } else if (data.field === "tauxHoraire") {
                setNettoyage((prev: NettoyageType) => ({
                  ...prev,
                  prix: {
                    ...prev.prix,
                    tauxHoraire: data.value as number,
                  },
                }));
              }
              const freqAnnuelle = nettoyage.quantites.freqAnnuelle;
              if (freqAnnuelle !== null) {
                // Utiliser les valeurs mises à jour
                const hParPassage =
                  data.field === "hParPassage"
                    ? (data.value as number)
                    : nettoyage.quantites.hParPassage;
                const tauxHoraire =
                  data.field === "tauxHoraire"
                    ? (data.value as number)
                    : nettoyage.prix.tauxHoraire;

                if (hParPassage !== null && tauxHoraire !== null) {
                  const totalService = freqAnnuelle * hParPassage * tauxHoraire;
                  const totalSamedi = nettoyage.infos.samediSelected
                    ? 52 * tauxHoraire * hParPassage
                    : null;

                  const totalDimanche = nettoyage.infos.dimancheSelected
                    ? 52 * tauxHoraire * hParPassage * MAJORATION_DIMANCHE
                    : null;
                  setTotalNettoyage((prev: TotalNettoyageType) => ({
                    ...prev,
                    totalService,
                    totalSamedi,
                    totalDimanche,
                  }));
                  toast({
                    title: t("tarifs-mis-a-jour"),
                    description: t(
                      "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                      { nomFournisseur: nettoyage.infos.nomFournisseur || "" }
                    ),
                    duration: 4000,
                  });
                }
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
          }
          return;
        case "repasse":
          if (clientSurfaceRounded === data.surface) {
            if (
              nettoyage.infos.fournisseurId === data.fournisseurId &&
              nettoyage.infos.repasseSelected
            ) {
              if (data.field === "hParPassage") {
                setNettoyage((prev: NettoyageType) => ({
                  ...prev,
                  quantites: {
                    ...prev.quantites,
                    hParPassageRepasse: data.value as number,
                  },
                }));
              } else if (data.field === "tauxHoraire") {
                setNettoyage((prev: NettoyageType) => ({
                  ...prev,
                  prix: {
                    ...prev.prix,
                    tauxHoraireRepasse: data.value as number,
                  },
                }));
              }
              const freqAnnuelle = nettoyage.quantites.freqAnnuelle;
              if (freqAnnuelle !== null) {
                const hParPassageRepasse =
                  data.field === "hParPassage"
                    ? (data.value as number)
                    : nettoyage.quantites.hParPassageRepasse;
                const tauxHoraireRepasse =
                  data.field === "tauxHoraire"
                    ? (data.value as number)
                    : nettoyage.prix.tauxHoraireRepasse;

                if (
                  hParPassageRepasse !== null &&
                  tauxHoraireRepasse !== null
                ) {
                  const totalRepasse =
                    freqAnnuelle * hParPassageRepasse * tauxHoraireRepasse;

                  setTotalNettoyage((prev: TotalNettoyageType) => ({
                    ...prev,
                    totalRepasse,
                  }));

                  // Notification spécifique pour le repasse
                  toast({
                    title: t("tarifs-mis-a-jour"),
                    description: t(
                      "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                      { nomFournisseur: nettoyage.infos.nomFournisseur || "" }
                    ),
                    duration: 4000,
                  });
                }
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
          }
          return;
        case "vitrerie":
          console.log("vitrerieData", data);

          if (
            nettoyage.infos.vitrerieSelected &&
            nettoyage.infos.fournisseurId === data.fournisseurId
          ) {
            setNettoyage((prev: NettoyageType) => ({
              ...prev,
              prix: {
                ...prev.prix,
                tauxHoraireVitrerie: data.tauxHoraireVitrerie as number | null,
                cadenceVitres: data.cadenceVitres as number | null,
                cadenceCloisons: data.cadenceCloisons as number | null,
                minFacturationVitrerie: data.minFacturationVitrerie as
                  | number
                  | null,
                fraisDeplacementVitrerie: data.fraisDeplacementVitrerie as
                  | number
                  | null,
              },
            }));

            const nbPassagesVitrerie = nettoyage.quantites.nbPassagesVitrerie;
            const surfaceVitres = nettoyage.quantites.surfaceVitres;
            const surfaceCloisons = nettoyage.quantites.surfaceCloisons;
            const cadenceVitres = data.cadenceVitres as number | null;
            const cadenceCloisons = data.cadenceCloisons as number | null;
            const tauxHoraireVitrerie = data.tauxHoraireVitrerie as
              | number
              | null;
            const minFacturationVitrerie = data.minFacturationVitrerie as
              | number
              | null;
            const fraisDeplacementVitrerie = data.fraisDeplacementVitrerie as
              | number
              | null;

            if (
              nbPassagesVitrerie !== null &&
              surfaceVitres !== null &&
              surfaceCloisons !== null &&
              cadenceVitres !== null &&
              cadenceCloisons !== null &&
              tauxHoraireVitrerie !== null
            ) {
              const totalVitrerie =
                nbPassagesVitrerie *
                Math.max(
                  (surfaceCloisons / cadenceCloisons +
                    surfaceVitres / cadenceVitres) *
                    tauxHoraireVitrerie +
                    (fraisDeplacementVitrerie ?? 0),
                  minFacturationVitrerie ?? 0
                );

              console.log("totalVitrerie", totalVitrerie);

              setTotalNettoyage((prev: TotalNettoyageType) => ({
                ...prev,
                totalVitrerie,
              }));
              toast({
                title: t("tarifs-mis-a-jour"),
                description: t(
                  "les-tarifs-de-nettoyage-infos-nomfournisseur-ont-ete-mis-a-jour-votre-devis-a-ete-recalcule",
                  { nomFournisseur: nettoyage.infos.nomFournisseur || "" }
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
        default:
          return;
      }
    },
    [
      client.surface,
      nettoyage.infos.dimancheSelected,
      nettoyage.infos.fournisseurId,
      nettoyage.infos.gammeSelected,
      nettoyage.infos.nomFournisseur,
      nettoyage.infos.repasseSelected,
      nettoyage.infos.samediSelected,
      nettoyage.infos.vitrerieSelected,
      nettoyage.prix.tauxHoraire,
      nettoyage.prix.tauxHoraireRepasse,
      nettoyage.quantites.freqAnnuelle,
      nettoyage.quantites.hParPassage,
      nettoyage.quantites.hParPassageRepasse,
      nettoyage.quantites.nbPassagesVitrerie,
      nettoyage.quantites.surfaceCloisons,
      nettoyage.quantites.surfaceVitres,
      setNettoyage,
      setTotalNettoyage,
      t,
      toast,
    ]
  );

  return updateNettoyageContext;
}
