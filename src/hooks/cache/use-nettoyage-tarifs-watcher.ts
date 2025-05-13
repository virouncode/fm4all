"use client";

import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { toast } from "@/hooks/use-toast";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { TotalNettoyageType } from "@/zod-schemas/total";
import { useEffect } from "react";

type UseNettoyageTarifsWatcherProps = {
  nettoyage: NettoyageType;
  setNettoyage: React.Dispatch<React.SetStateAction<NettoyageType>>;
  setTotalNettoyage: React.Dispatch<React.SetStateAction<TotalNettoyageType>>;
  nettoyageTarifs: SelectNettoyageTarifsType[];
  t: (key: string, params?: Record<string, string | number | Date>) => string;
};

/**
 * Hook personnalisé pour surveiller les changements dans les tarifs de nettoyage
 * et mettre à jour les contextes correspondants lorsque les tarifs changent.
 */
export function useNettoyageTarifsWatcher({
  nettoyage,
  setNettoyage,
  setTotalNettoyage,
  nettoyageTarifs,
  t,
}: UseNettoyageTarifsWatcherProps) {
  // Surveiller les changements dans nettoyageTarifs pour mettre à jour les totaux
  useEffect(() => {
    // Ne procéder que si un fournisseur et une gamme sont sélectionnés
    if (!nettoyage.infos.fournisseurId || !nettoyage.infos.gammeSelected)
      return;

    // Trouver le tarif correspondant dans les tarifs actuels
    const currentTarif = nettoyageTarifs.find(
      (tarif) =>
        tarif.fournisseurId === nettoyage.infos.fournisseurId &&
        tarif.gamme === nettoyage.infos.gammeSelected
    );

    if (!currentTarif) return;

    // Vérifier si les tarifs ont changé par rapport à ceux stockés dans le contexte
    const tarifChanged =
      currentTarif.hParPassage !== nettoyage.quantites.hParPassage ||
      currentTarif.tauxHoraire !== nettoyage.prix.tauxHoraire;

    // Si les tarifs ont changé, mettre à jour le contexte et recalculer les totaux
    if (tarifChanged) {
      console.log(
        `Tarifs mis à jour pour ${nettoyage.infos.nomFournisseur} (${nettoyage.infos.gammeSelected}):`,
        `hParPassage: ${nettoyage.quantites.hParPassage} -> ${currentTarif.hParPassage},`,
        `tauxHoraire: ${nettoyage.prix.tauxHoraire} -> ${currentTarif.tauxHoraire}`
      );

      // Mettre à jour le nettoyage avec les nouveaux tarifs
      setNettoyage((prev: NettoyageType) => ({
        ...prev,
        quantites: {
          ...prev.quantites,
          hParPassage: currentTarif.hParPassage,
        },
        prix: {
          ...prev.prix,
          tauxHoraire: currentTarif.tauxHoraire,
        },
      }));

      // Recalculer uniquement les totaux qui dépendent des tarifs de nettoyage
      const freqAnnuelle = nettoyage.quantites.freqAnnuelle;
      if (freqAnnuelle !== null) {
        // 1. Recalculer le total du service principal
        const totalService =
          freqAnnuelle * currentTarif.hParPassage * currentTarif.tauxHoraire;

        // 2. Recalculer le total du samedi si sélectionné
        const totalSamedi = nettoyage.infos.samediSelected
          ? 52 * currentTarif.tauxHoraire * currentTarif.hParPassage
          : null;

        // 3. Recalculer le total du dimanche si sélectionné
        const totalDimanche = nettoyage.infos.dimancheSelected
          ? 52 *
            currentTarif.tauxHoraire *
            currentTarif.hParPassage *
            MAJORATION_DIMANCHE
          : null;

        // Mettre à jour le contexte totalNettoyage en conservant les autres valeurs
        setTotalNettoyage((prev: TotalNettoyageType) => ({
          ...prev,
          totalService,
          totalSamedi,
          totalDimanche,
        }));

        // Afficher une notification à l'utilisateur
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
  }, [
    nettoyage.infos.fournisseurId,
    nettoyage.infos.gammeSelected,
    nettoyage.infos.nomFournisseur,
    nettoyage.infos.samediSelected,
    nettoyage.infos.dimancheSelected,
    nettoyage.quantites.hParPassage,
    nettoyage.quantites.freqAnnuelle,
    nettoyage.prix.tauxHoraire,
    nettoyageTarifs,
    setNettoyage,
    setTotalNettoyage,
    t,
  ]);
}
