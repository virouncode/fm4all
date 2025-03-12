"use client";
import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { FireExtinguisher } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
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
  const { client } = useContext(ClientContext);
  const { setServices } = useContext(ServicesContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const propositionsRef = useRef<HTMLDivElement>(null);
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

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="6">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={FireExtinguisher}
          title="Securité Incendie"
          description="Extincteurs, blocs autonomes d'éclairage de sécurité (BAES), télécommande BAES, laissez nos experts vérifier vos installations."
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={FireExtinguisher}
          title="Securité Incendie"
          description="Extincteurs, blocs autonomes d'éclairage de sécurité (BAES), télécommande BAES, laissez nos experts vérifier vos installations."
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
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default SecuriteIncendie;
