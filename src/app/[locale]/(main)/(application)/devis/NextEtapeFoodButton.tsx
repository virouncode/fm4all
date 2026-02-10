"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";

const NextEtapeFoodButton = () => {
  const t = useTranslations("DevisPage");
  const prospect = useProspectStore((s) => s.prospect);
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const router = useRouter();

  const handleClickNext = () => {
    const searchParams = new URLSearchParams();
    if (prospect.effectif)
      searchParams.set("effectif", prospect.effectif.toString());
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
