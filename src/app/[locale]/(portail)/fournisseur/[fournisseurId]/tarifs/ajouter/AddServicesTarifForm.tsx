"use client";

import { insertServiceFournisseurAction } from "@/actions/serviceFournisseurActions";
import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import { Button } from "@/components/ui/button";
import { servicesMapping } from "@/constants/services";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type AddServicesTarifFormProps = {
  fournisseurId: number;
  fournisseurServices?: string[];
};

const AddServicesTarifForm = ({
  fournisseurId,
  fournisseurServices,
}: AddServicesTarifFormProps) => {
  const [selectedServicesIds, setSelectedServicesIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleAddService = (serviceId: number) => {
    if (selectedServicesIds.includes(serviceId)) {
      setSelectedServicesIds((prev) => prev.filter((id) => id !== serviceId));
    } else {
      setSelectedServicesIds((prev) => [...prev, serviceId]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const serviceId of selectedServicesIds) {
        await insertServiceFournisseurAction({
          fournisseurId,
          serviceId,
        });
      }
      toast({
        title: "Services ajoutés",
        description: "Les services ont été ajoutés avec succès.",
      });
      router.push({
        pathname: "/fournisseur/[fournisseurId]/tarifs",
        params: { fournisseurId: fournisseurId.toString() },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-20">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center">
        {servicesMapping
          .filter(({ nom }) => !fournisseurServices?.includes(nom))
          .map((service) => (
            <ServicePresentationCard
              key={service.nom}
              title={service.titre}
              icons={service.icons}
              onClick={() => handleAddService(service.id)}
              className={
                selectedServicesIds.includes(service.id)
                  ? "cursor-pointer border-fm4allsecondary text-fm4allsecondary border-2"
                  : "cursor-pointer"
              }
            />
          ))}
      </div>
      <Button
        variant="destructive"
        size="lg"
        title="ajouter"
        onClick={handleSubmit}
        disabled={selectedServicesIds.length === 0 || loading}
        className="w-60 mx-auto"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Ajouter"}
      </Button>
    </div>
  );
};

export default AddServicesTarifForm;
