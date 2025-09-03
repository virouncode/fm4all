"use client";

import { Button } from "@/components/ui/button";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const NextEtapeFoodButton = () => {
  const t = useTranslations("DevisPage");
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
    router.push({
      pathname: "/devis/food-beverage",
      query: Object.fromEntries(searchParams.entries()),
    });
  };

  return (
    <div className="text-center lg:hidden">
      <Button
        variant="destructive"
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

export default NextEtapeFoodButton;
