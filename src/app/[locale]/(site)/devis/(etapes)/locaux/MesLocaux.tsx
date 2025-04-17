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
import { MAX_EFFECTIF, MAX_SURFACE } from "@/constants/constants";
import { departements } from "@/constants/departements";
import { occupation } from "@/constants/occupation";
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
import { useRouter } from "@/i18n/navigation";
import { createMesLocauxSchema, MesLocauxType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { reinitialisationDevis } from "./reinitialisationDevis";
import ServicesLoader from "./ServicesLoader";

const MesLocaux = () => {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  const tDevisButton = useTranslations("devisButton");
  const tErrors = useTranslations("DevisPage.locaux.locauxForm.erreurs");
  const [loading, setLoading] = useState(false);
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

  const defaultValues: MesLocauxType = {
    surface: client.surface.toString(),
    effectif: client.effectif.toString(),
    typeBatiment: client.typeBatiment,
    typeOccupation: client.typeOccupation,
    codePostal: client.codePostal || "",
  };

  const form = useForm<MesLocauxType>({
    mode: "onBlur",
    resolver: zodResolver(
      createMesLocauxSchema({
        surface: tErrors("surface"),
        effectif: tErrors("effectif"),
        batiment: tErrors("batiment"),
        occupation: tErrors("occupation"),
        codePostal: tErrors("codePostal"),
      })
    ),
    defaultValues,
  });

  const submitForm = async (data: MesLocauxType) => {
    const dataToPost = {
      ...data,
      surface: parseInt(data.surface as string),
      effectif: parseInt(data.effectif as string),
      ville: "",
    };
    setLoading(true);
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
          title: t("code-postal-invalide"),
          description: t(
            "le-code-postal-ne-correspond-a-aucune-ville-veullez-reessayer"
          ),
        });
        setLoading(false);
        return;
      }
      dataToPost.ville = cityData[0].nom;
      setClient({
        ...client,
        ville: dataToPost.ville,
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
    //Departement in ou out
    if (
      !departements.find(
        ({ id }) => id === dataToPost.codePostal?.substring(0, 2)
      )
    ) {
      setDevisProgress({ ...devisProgress, completedSteps: [] });
      router.push({
        pathname: "/chalandise",
        query: {
          destination: "/",
          codePostal: dataToPost.codePostal,
          ville: dataToPost.ville,
          surface: dataToPost.surface,
          effectif: dataToPost.effectif,
          typeBatiment: dataToPost.typeBatiment,
          typeOccupation: dataToPost.typeOccupation,
        },
      }); //TODO
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
    window.scrollTo(0, 0);
    //Passer à l'étape suivante
    setTimeout(() => {
      router.push({
        pathname: "/devis/services",
        query: Object.fromEntries(serviceSearchParams.entries()),
      });
    }, 3000);
  };

  // const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   if (name === "surface") {
  //     const newValue = value ? parseInt(value) : 50;
  //     setClient((prev) => ({
  //       ...prev,
  //       [name]: newValue > MAX_SURFACE ? MAX_SURFACE : newValue,
  //     }));
  //     return;
  //   }
  //   if (name === "effectif") {
  //     const newValue = value ? parseInt(value) : 1;
  //     setClient((prev) => ({
  //       ...prev,
  //       [name]: newValue > MAX_EFFECTIF ? MAX_EFFECTIF : newValue,
  //     }));
  //     return;
  //   }
  //   setClient((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

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
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("code-postal")}
              nameInSchema="codePostal"
              placeholder="XXXXX"
            />
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("surface-en-m")}
              nameInSchema="surface"
              type="number"
              min={50}
              max={MAX_SURFACE}
            />
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("nombre-moyen-de-personnes")}
              nameInSchema="effectif"
              type="number"
              min={1}
              max={MAX_EFFECTIF}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 ">
            <SelectWithLabel<MesLocauxType>
              fieldTitle={t("type-de-batiment")}
              nameInSchema="typeBatiment"
              data={batiments}
              handleSelect={handleSelect}
              translationPrefix="DevisPage.locaux.locauxForm.batiments"
            />
            <SelectWithLabel<MesLocauxType>
              fieldTitle={t("type-doccupation")}
              nameInSchema="typeOccupation"
              data={occupation}
              handleSelect={handleSelect}
              translationPrefix="DevisPage.locaux.locauxForm.occupation"
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
                  title={t("afficher-les-tarifs")}
                  className="text-base"
                  disabled={loading}
                >
                  {t("afficher-les-tarifs")}
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{tDevisButton("devis-en-cours")}</DialogTitle>
                <DialogDescription>
                  {t(
                    "un-devis-est-deja-en-cours-souaitez-vous-recommencer-un-nouveau-devis-vos-informations-actuelles-seront-perdues"
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <div className="flex gap-4 justify-center mx-auto">
                    <Button
                      variant="destructive"
                      onClick={() => form.handleSubmit(submitForm)()}
                    >
                      {tDevisButton("nouveau")}
                    </Button>
                    {/* <Button variant="outline" onClick={handleClickReprendre}>
                      Reprendre
                    </Button> */}
                    <Button variant="outline">{t("annuler")}</Button>
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
              title={t("afficher-les-tarifs")}
              className="text-base"
              disabled={loading}
            >
              {loading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                t("afficher-les-tarifs")
              )}
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
