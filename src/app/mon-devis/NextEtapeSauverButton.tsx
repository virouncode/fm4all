"use client";

import { Button } from "@/components/ui/button";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const NextEtapeSauverButton = () => {
  const { client } = useContext(ClientContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);
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
        title: "Panier vide",
        description:
          "Vous n'avez choisi aucun service, veuillez sélectionner au moins un service",
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
    router.push(
      `/mon-devis/sauvegarder-ma-progression?${searchParams.toString()}`
    );
  };

  return (
    <div className="text-center lg:hidden">
      <Button
        variant="destructive"
        size="lg"
        className="text-base"
        title="Passer à l'étape suivante"
        onClick={handleClickNext}
      >
        Suivant →
      </Button>
    </div>
  );
};

export default NextEtapeSauverButton;
