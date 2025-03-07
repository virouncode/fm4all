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
import { useToast } from "@/hooks/use-toast";
import {
  InsertClientType,
  mesLocauxSchema,
  MesLocauxType,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { reinitialisationDevis } from "./reinitialisationDevis";
import ServicesLoader from "./ServicesLoader";

export const MAX_SURFACE = 3000;
export const MAX_EFFECTIF = 300;

const MesLocaux = () => {
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
  const dialogRef = useRef<HTMLButtonElement>(null);
  const [loaderVisible, setLoaderVisible] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

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

  const submitForm = async (data: MesLocauxType) => {
    const dataToPost = {
      ...data,
      surface: parseInt(data.surface as string),
      effectif: parseInt(data.effectif as string),
      ville: "",
    };
    //La ville existe ?
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${dataToPost.codePostal}`
      );
      const cityData = await response.json();

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
      setClient({
        ...client,
        ville: dataToPost.ville,
      });
    } catch (err) {
      console.log(err);
    }
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
      setFontaines,
      setOfficeManager,
      setServicesFm4All,
      setCommentaires,
      //navigation
      setServices,
      setFoodBeverage,
      setManagement,
      setPersonnalisation,
      setMonDevis,
      //Total
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
    setLoaderVisible(true);
    //Passer à l'étape suivante
    setTimeout(() => {
      router.push(
        `/mon-devis/mes-services?effectif=${data.effectif}&surface=${data.surface}`
      );
    }, 3000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "surface") {
      const newValue = value ? parseInt(value) : 50;
      setClient((prev) => ({
        ...prev,
        [name]: newValue > MAX_SURFACE ? MAX_SURFACE : newValue,
      }));
      return;
    }
    if (name === "effectif") {
      const newValue = value ? parseInt(value) : 1;
      setClient((prev) => ({
        ...prev,
        [name]: newValue > MAX_EFFECTIF ? MAX_EFFECTIF : newValue,
      }));
      return;
    }
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (value: string, name: string) => {
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClick = () => {
    const dialogTrigger = dialogRef.current;
    if (dialogTrigger && !form.formState.isValid) {
      dialogTrigger.click();
    }
  };

  // const handleClickReprendre = () => {
  //   const route = devisProgress.currentStep
  //     ? devisRoutes.find(({ id }) => id === devisProgress.currentStep) ??
  //       devisRoutes[0]
  //     : devisRoutes[0];
  //   const url = route.url;
  //   router.push(`/mon-devis${url}`);
  // };

  return !loaderVisible ? (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-14 mx-auto w-full md:w-2/3 mt-6 md:mt-10 p-1"
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
              max={MAX_SURFACE}
            />
            <InputWithLabel<InsertClientType>
              fieldTitle="Nombre moyen de personnes*"
              nameInSchema="effectif"
              type="number"
              min={1}
              max={MAX_EFFECTIF}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<InsertClientType>
              fieldTitle="Type de bâtiment*"
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
            />
            <SelectWithLabel<InsertClientType>
              fieldTitle="Type d'occupation*"
              nameInSchema="typeOccupation"
              data={occupations}
              handleSelect={handleSelect}
            />
          </div>
        </div>
        {devisProgress.completedSteps.includes(1) ? (
          <Dialog>
            <DialogTrigger asChild ref={dialogRef} onClick={handleClick}>
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

            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>Devis en cours</DialogTitle>
                <DialogDescription>
                  Un devis est déjà en cours. Souaitez-vous recommencer un
                  nouveau devis (vos informations actuelles seront perdues) ou
                  reprendre ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <div className="flex gap-4 justify-center mx-auto">
                    <Button
                      variant="destructive"
                      onClick={() => form.handleSubmit(submitForm)()}
                    >
                      Nouveau
                    </Button>
                    {/* <Button variant="outline" onClick={handleClickReprendre}>
                      Reprendre
                    </Button> */}
                    <Button variant="outline">Annuler</Button>
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              title="Afficher les tarifs"
              className="text-base"
              disabled={!form.formState.isValid}
            >
              Afficher les tarifs
            </Button>
          </div>
        )}
      </form>
    </Form>
  ) : (
    <ServicesLoader />
  );
};
export default MesLocaux;
