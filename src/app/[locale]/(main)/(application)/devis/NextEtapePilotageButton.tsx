"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useClientStore } from "@/stores/clientStore";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";

const NextEtapePilotageButton = () => {
  const t = useTranslations("DevisPage");
  const client = useClientStore((s) => s.client);
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const router = useRouter();

  const handleClickNext = () => {
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 4, completedSteps: newCompletedSteps });
    router.push({
      pathname: "/devis/pilotage",
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

export default NextEtapePilotageButton;
