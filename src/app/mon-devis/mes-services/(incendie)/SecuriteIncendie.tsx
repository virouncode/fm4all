"use client";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { FireExtinguisher } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import SecuriteIncendiePropositions from "./SecuriteIncendiePropositions";

type SecuriteIncendieProps = {
  incendieQuantite?: SelectIncendieQuantitesType | null;
  incendieTarifs?: SelectIncendieTarifsType[];
};

const SecuriteIncendie = ({
  incendieQuantite,
  incendieTarifs,
}: SecuriteIncendieProps) => {
  const { setServices } = useContext(ServicesContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();
  useScrollIntoService();

  const handleClickNext = () => {
    setDevisProgress({ currentStep: 3, completedSteps: [1, 2] });
    router.push("/mon-devis/food-beverage");
  };
  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <FireExtinguisher />
          <p>Securité Incendie</p>
        </div>
        <p className="text-base w-2/3 text-center italic px-4">
          Extincteurs, blocs autonomes d&apos;éclairage de sécurité (BAES),
          télécommande BAES, laissez nos experts vérifier vos installations.
        </p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        {incendieQuantite && incendieTarifs && (
          <SecuriteIncendiePropositions
            incendieQuantite={incendieQuantite}
            incendieTarifs={incendieTarifs}
          />
        )}
      </div>
      <p className="text-sm italic text-end px-1">
        *frais de déplacement inclus, pas de déclinaison en gammes car service
        réglementaire
      </p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default SecuriteIncendie;
