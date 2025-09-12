"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useClientStore } from "@/stores/clientStore";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import { useTranslations } from "next-intl";

const NextEtapeFoodButton = () => {
  const t = useTranslations("DevisPage");
  const client = useClientStore((s) => s.client);
  const { devisProgress, setDevisProgress } = useDevisProgressStore((s) => ({
    devisProgress: s.devisProgress,
    setDevisProgress: s.setDevisProgress,
  }));
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
