"use client";
import { fullReinitialisationDevis } from "@/app/[locale]/mon-devis/(etapes)/mes-locaux/fullReinitialisationDevis";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { CommentairesContext } from "@/context/CommentairesProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FontainesContext } from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { IncendieContext } from "@/context/IncendieProvider";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { ManagementContext } from "@/context/ManagementProvider";
import { MonDevisContext } from "@/context/MonDevisProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { TotalContext } from "@/context/TotalProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useContext } from "react";

type DevisButtonProps = {
  title: string;
  text: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
  disabled?: boolean;
  setIsMobileNavOpen?: Dispatch<SetStateAction<boolean>>;
};

const DevisButton = ({
  title,
  text,
  className,
  size = "default",
  disabled = false,
  setIsMobileNavOpen,
}: DevisButtonProps) => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { setServices } = useContext(ServicesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setManagement } = useContext(ManagementContext);
  const { setPersonnalisation } = useContext(PersonnalisationContext);
  const { setMonDevis } = useContext(MonDevisContext);
  const { client, setClient } = useContext(ClientContext);
  const { setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setMaintenance } = useContext(MaintenanceContext);
  const { setIncendie } = useContext(IncendieContext);
  const { setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setFontaines } = useContext(FontainesContext);
  const { setOfficeManager } = useContext(OfficeManagerContext);
  const { setServicesFm4All } = useContext(ServicesFm4AllContext);
  const { setCommentaires } = useContext(CommentairesContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { setTotalIncendie } = useContext(TotalIncendieContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const { setTotalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { setTotalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const { setTotal } = useContext(TotalContext);
  const router = useRouter();

  const serviceSearchParams = new URLSearchParams();
  const sauvegarderSearchParams = new URLSearchParams();

  if (client.effectif) {
    serviceSearchParams.set("effectif", client.effectif.toString());
    sauvegarderSearchParams.set("effectif", client.effectif.toString());
  }
  if (client.surface) {
    serviceSearchParams.set("surface", client.surface.toString());
    sauvegarderSearchParams.set("surface", client.surface.toString());
  }
  if (client.typeBatiment) {
    sauvegarderSearchParams.set("typeBatiment", client.typeBatiment);
  }
  if (client.typeOccupation) {
    sauvegarderSearchParams.set("typeOccupation", client.typeOccupation);
  }

  const devisRoutes = [
    {
      id: 1,
      url: "/mes-locaux",
      name: "Mes locaux",
    },
    {
      id: 2,
      url: `/mes-services?${serviceSearchParams.toString()}`,
      name: "Mes services",
    },
    {
      id: 3,
      url: `/food-beverage`,
      name: "Food & Beverage",
    },
    {
      id: 4,
      url: `/pilotage-prestations?${serviceSearchParams.toString()}`,
      name: "Office Management",
    },
    {
      id: 5,
      url: `/sauvegarder-ma-progression?${sauvegarderSearchParams.toString()}`,
      name: "Sauvegarder",
    },
    {
      id: 6,
      url: "/personnaliser-mon-devis",
      name: "Personnaliser",
    },
    {
      id: 7,
      url: "/afficher-mon-devis",
      name: "Afficher mon devis",
    },
  ];

  const handleClickReprendre = () => {
    const route = devisProgress.currentStep
      ? (devisRoutes.find(({ id }) => id === devisProgress.currentStep) ??
        devisRoutes[0])
      : devisRoutes[0];
    const url = route.url;
    router.push(`/mon-devis${url}`);
  };
  const handleClickNouveau = async () => {
    fullReinitialisationDevis(
      setClient,
      setDevisProgress,
      setNettoyage,
      setHygiene,
      setMaintenance,
      setIncendie,
      setCafe,
      setThe,
      setSnacksFruits,
      setFontaines,
      setOfficeManager,
      setServicesFm4All,
      setCommentaires,
      setServices,
      setFoodBeverage,
      setManagement,
      setPersonnalisation,
      setMonDevis,
      setTotalNettoyage,
      setTotalHygiene,
      setTotalMaintenance,
      setTotalIncendie,
      setTotalCafe,
      setTotalThe,
      setTotalSnacksFruits,
      setTotalFontaines,
      setTotalOfficeManager,
      setTotalServicesFm4All,
      setTotal
    );
    if (setIsMobileNavOpen) setIsMobileNavOpen(false);
    router.push("/mon-devis/mes-locaux");
  };

  // const handleAlert = () => {
  //   toast({
  //     description:
  //       "Les devis en ligne ne sont pas encore possibles depuis un mobile. Essayez depuis un ordinateur ou contactez-nous",
  //     action: (
  //       <ToastAction altText="Contactez-nous" asChild>
  //         <Link href="/contact">Contact</Link>
  //       </ToastAction>
  //     ),
  //   });
  // };

  return devisProgress.completedSteps.includes(1) ? (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size={size}
          title={text}
          className={`text-base ${className}`}
          disabled={disabled}
          onClick={
            setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined
          }
        >
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Devis en cours</DialogTitle>
          <DialogDescription>
            Un devis est déjà en cours. Souhaitez-vous le reprendre ou en créer
            un nouveau (vos informations seront perdues) ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <div className="flex gap-4 justify-center mx-auto">
              <Button variant="destructive" onClick={handleClickNouveau}>
                Nouveau
              </Button>
              <Button onClick={handleClickReprendre} variant="outline">
                Reprendre
              </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="flex justify-center">
      <Button
        variant="destructive"
        size={size}
        title={title}
        className={`text-base ${className}`}
        onClick={handleClickNouveau}
        disabled={disabled}
      >
        {text}
      </Button>
    </div>
  );
};

export default DevisButton;
