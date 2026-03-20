"use client";
import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { useRouter } from "@/i18n/navigation";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useServicesStore } from "@/stores/devis/servicesStore";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites.schema";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs.schema";
import { FireExtinguisher } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import SecuriteIncendiePropositions from "./SecuriteIncendiePropositions";

type SecuriteIncendieProps = {
  incendieQuantite: SelectIncendieQuantitesType;
  incendieTarifs: SelectIncendieTarifsType[];
};

const SecuriteIncendie = ({
  incendieQuantite,
  incendieTarifs,
}: SecuriteIncendieProps) => {
  const t = useTranslations("DevisPage.services.incendie");
  const prospect = useProspectStore((s) => s.prospect);
  const setServices = useServicesStore((s) => s.setServices);
  const { devisProgress, setDevisProgress } = useDevisProgressStore(
    useShallow((s) => ({
      devisProgress: s.devisProgress,
      setDevisProgress: s.setDevisProgress,
    })),
  );
  const propositionsRef = useRef<HTMLDivElement>(null);
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

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="6">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={FireExtinguisher}
          title={t("securite-incendie")}
          description={t(
            "extincteurs-blocs-autonomes-declairage-de-securite-baes-telecommande-baes-laissez-nos-experts-verifier-vos-installations",
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={FireExtinguisher}
          title={t("securite-incendie")}
          description={t(
            "extincteurs-blocs-autonomes-declairage-de-securite-baes-telecommande-baes-laissez-nos-experts-verifier-vos-installations",
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        <SecuriteIncendiePropositions
          incendieQuantite={incendieQuantite}
          incendieTarifs={incendieTarifs}
        />
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default SecuriteIncendie;
