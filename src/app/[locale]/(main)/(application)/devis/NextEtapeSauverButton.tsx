"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { useClientStore } from "@/stores/clientStore";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import { useServicesFm4AllStore } from "@/stores/servicesFm4AllStore";
import { useTotalServicesFm4AllStore } from "@/stores/totalServicesFm4AllStore";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";

const NextEtapeSauverButton = () => {
  const t = useTranslations("DevisPage");
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
  const client = useClientStore((s) => s.client);
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const totalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.totalServicesFm4All,
  );
  const router = useRouter();

  const handleClickNext = () => {
    const totalFinalServicesFm4All =
      servicesFm4All.infos.gammeSelected === "essentiel"
        ? (totalServicesFm4All.totalAssurance ?? 0) +
          (totalServicesFm4All.totalPlateforme ?? 0) +
          (totalServicesFm4All.totalSupportAdmin ?? 0) -
          (totalServicesFm4All.totalRemiseCa ?? 0) -
          (totalServicesFm4All.totalRemiseHof ?? 0)
        : servicesFm4All.infos.gammeSelected === "confort"
          ? (totalServicesFm4All.totalAssurance ?? 0) +
            (totalServicesFm4All.totalPlateforme ?? 0) +
            (totalServicesFm4All.totalSupportAdmin ?? 0) +
            (totalServicesFm4All.totalSupportOp ?? 0) -
            (totalServicesFm4All.totalRemiseCa ?? 0) -
            (totalServicesFm4All.totalRemiseHof ?? 0)
          : (totalServicesFm4All.totalAssurance ?? 0) +
            (totalServicesFm4All.totalPlateforme ?? 0) +
            (totalServicesFm4All.totalSupportAdmin ?? 0) +
            (totalServicesFm4All.totalSupportOp ?? 0) +
            (totalServicesFm4All.totalAccountManager ?? 0) -
            (totalServicesFm4All.totalRemiseCa ?? 0) -
            (totalServicesFm4All.totalRemiseHof ?? 0);
    if (!totalFinalServicesFm4All) {
      toast({
        variant: "destructive",
        title: tFm4all("panier-vide"),
        description: tFm4all(
          "vous-navez-choisi-aucun-service-veuillez-selectionner-au-moins-un-service",
        ),
      });
      return;
    }
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    if (client.typeBatiment)
      searchParams.set("typeBatiment", client.typeBatiment);
    if (client.typeOccupation)
      searchParams.set("typeOccupation", client.typeOccupation);
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3, 4]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 5, completedSteps: newCompletedSteps });
    router.push({
      pathname: "/devis/sauvegarder",
      query: Object.fromEntries(searchParams.entries()),
    });
  };

  return (
    <div className="text-center lg:hidden">
      <Button
        size="lg"
        className="text-base"
        title={t("passer-a-letape-suivante")}
        onClick={handleClickNext}
      >
        {t("suivant-0")}
      </Button>
    </div>
  );
};

export default NextEtapeSauverButton;
