"use client";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { FireExtinguisher } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
import SecuriteIncendiePropositions from "./SecuriteIncendiePropositions";

type SecuriteIncendieProps = {
  incendieQuantite: SelectIncendieQuantitesType;
  incendieTarifs: SelectIncendieTarifsType[];
};

const SecuriteIncendie = ({
  incendieQuantite,
  incendieTarifs,
}: SecuriteIncendieProps) => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { setServices } = useContext(ServicesContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();

  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: 1,
    }));
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (cafe.cafeFournisseurId)
      searchParams.set("cafeFournisseurId", cafe.cafeFournisseurId.toString());
    setDevisProgress({ currentStep: 3, completedSteps: [1, 2] });
    router.push(`/mon-devis/food-beverage?${searchParams.toString()}`);
  };

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="6">
      <PropositionsTitle
        icon={FireExtinguisher}
        title="Securité Incendie"
        description="Extincteurs, blocs autonomes d'éclairage de sécurité (BAES), télécommande BAES, laissez nos experts vérifier vos installations."
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
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
