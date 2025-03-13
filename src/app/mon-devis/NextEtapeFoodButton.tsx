"use client";

import { Button } from "@/components/ui/button";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const NextEtapeFoodButton = () => {
  const { client } = useContext(ClientContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();

  const handleClickNext = () => {
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2]),
    ].sort((a, b) => a - b);
    setDevisProgress({
      currentStep: 3,
      completedSteps: newCompletedSteps,
    });
    router.push(`/mon-devis/food-beverage?${searchParams.toString()}`);
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

export default NextEtapeFoodButton;
