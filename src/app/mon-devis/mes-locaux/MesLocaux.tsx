"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { SelectWithLabel } from "@/components/formInputs/SelectWithLabel";
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
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { departements } from "@/constants/departements";
import { occupations } from "@/constants/occupations";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { IncendieContext } from "@/context/IncendieProvider";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { ManagementContext } from "@/context/ManagementProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { useToast } from "@/hooks/use-toast";
import {
  InsertClientType,
  mesLocauxSchema,
  MesLocauxType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { reinitialisationDevis } from "./reinitialisationDevis";

const MesLocaux = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { setServices } = useContext(ServicesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setManagement } = useContext(ManagementContext);
  const { setPersonnalisation } = useContext(PersonnalisationContext);
  const { client, setClient } = useContext(ClientContext);
  const { setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setMaintenance } = useContext(MaintenanceContext);
  const { setIncendie } = useContext(IncendieContext);
  const { setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setOfficeManager } = useContext(OfficeManagerContext);
  const { setServicesFm4All } = useContext(ServicesFm4AllContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { setTotalIncendie } = useContext(TotalIncendieContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { setTotalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { setTotalServicesFm4All } = useContext(TotalServicesFm4AllContext);

  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: MesLocauxType = {
    surface: client.surface.toString(),
    effectif: client.effectif.toString(),
    typeBatiment: client.typeBatiment,
    typeOccupation: client.typeOccupation,
    codePostal: client.codePostal || "",
  };

  const form = useForm<MesLocauxType>({
    mode: "onBlur",
    resolver: zodResolver(mesLocauxSchema),
    defaultValues,
  });

  // const handleSelect = (value: string, name: string) => {
  //   setClient((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const submitForm = async (data: MesLocauxType) => {
    const dataToPost = {
      ...data,
      surface: parseInt(data.surface as string),
      effectif: parseInt(data.effectif as string),
      ville: "",
    };
    //Departement in ou out
    if (
      !departements.find(
        ({ id }) => id === dataToPost.codePostal?.substring(0, 2)
      )
    ) {
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      router.push("/city-out?destination=/");
      return;
    }
    //La ville existe ?
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${dataToPost.codePostal}`
      );
      const cityData = await response.json();
      console.log(cityData);

      if (cityData.length === 0) {
        setDevisProgress({ ...devisProgress, completedSteps: [] });
        toast({
          variant: "destructive",
          title: "Code postal invalide",
          description:
            "Le code postal ne correspond à aucune ville, veullez réessayer",
        });
        return;
      }
      dataToPost.ville = cityData[0].nom;
    } catch (err) {
      console.log(err);
    }

    //Update client
    setClient((prev) => ({
      ...prev,
      ...dataToPost,
    }));
    //Réinitialisation de tous le devis
    reinitialisationDevis(
      //client
      parseInt(data.surface as string),
      parseInt(data.effectif as string),
      //services
      setDevisProgress,
      setNettoyage,
      setHygiene,
      setMaintenance,
      setIncendie,
      setCafe,
      setThe,
      setSnacksFruits,
      setOfficeManager,
      setServicesFm4All,
      //navigation
      setServices,
      setFoodBeverage,
      setManagement,
      setPersonnalisation,
      //Total
      setTotalNettoyage,
      setTotalHygiene,
      setTotalMaintenance,
      setTotalIncendie,
      setTotalCafe,
      setTotalThe,
      setTotalSnacksFruits,
      setTotalOfficeManager,
      setTotalServicesFm4All
    );
    // localStorage.clear();
    //Passer à l'étape suivante
    router.push(
      `/mon-devis/mes-services?effectif=${data.effectif}&surface=${data.surface}`
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-6 md:mt-10"
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <InputWithLabel<InsertClientType>
              fieldTitle="Code postal*"
              nameInSchema="codePostal"
              placeholder="XXXXX"
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Surface en m²*"
              nameInSchema="surface"
              type="number"
              min={50}
              max={3000}
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              type="number"
              min={1}
              max={300}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<InsertClientType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
            />
            <SelectWithLabel<InsertClientType>
              fieldTitle="Type d'occupation*"
              nameInSchema="typeOccupation"
              data={occupations}
            />
          </div>
        </div>
        {devisProgress.completedSteps.includes(1) ? (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  title="Afficher les tarifs"
                  className="text-base"
                  disabled={!form.formState.isValid}
                >
                  Afficher les tarifs
                </Button>
              </div>
            </DialogTrigger>
            {form.formState.isValid && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Devis en cours</DialogTitle>
                  <DialogDescription>
                    Un devis est déjà en cours. Souaitez-vous poursuivre (vos
                    informations de devis seront perdues) ?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <div className="flex gap-4">
                      <Button
                        variant="destructive"
                        onClick={() => form.handleSubmit(submitForm)()}
                      >
                        Poursuivre
                      </Button>
                      <Button variant="outline">Annuler</Button>
                    </div>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              title="Afficher les tarifs"
              className="text-base"
            >
              Afficher les tarifs
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
export default MesLocaux;
