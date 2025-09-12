"use client";

import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { SelectWithLabel } from "@/components/form-inputs/SelectWithLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { batiments } from "@/constants/batiments";
import { MAX_EFFECTIF, MAX_SURFACE } from "@/constants/constants";
import { departements } from "@/constants/departements";
import { occupation } from "@/constants/occupation";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { useCafeStore } from "@/stores/cafeStore";
import { useClientStore } from "@/stores/clientStore";
import { useCommentairesStore } from "@/stores/commentairesStore";
import { useDevisProgressStore } from "@/stores/devisProgressStore";
import { useFontainesStore } from "@/stores/fontainesStore";
import { useFoodBeverageStore } from "@/stores/foodBeverageStore";
import { useHygieneStore } from "@/stores/hygieneStore";
import { useIncendieStore } from "@/stores/incendieStore";
import { useMaintenanceStore } from "@/stores/maintenanceStore";
import { useManagementStore } from "@/stores/managementStore";
import { useMonDevisStore } from "@/stores/monDevisStore";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { useOfficeManagerStore } from "@/stores/officeManagerStore";
import { usePersonnalisationStore } from "@/stores/personnalisationStore";
import { useServicesFm4AllStore } from "@/stores/servicesFm4AllStore";
import { useServicesStore } from "@/stores/servicesStore";
import { useSnacksFruitsStore } from "@/stores/snacksFruitsStore";
import { useTheStore } from "@/stores/theStore";
import { useTotalCafeStore } from "@/stores/totalCafeStore";
import { useTotalFontainesStore } from "@/stores/totalFontainesStore";
import { useTotalHygieneStore } from "@/stores/totalHygieneStore";
import { useTotalIncendieStore } from "@/stores/totalIncendieStore";
import { useTotalMaintenanceStore } from "@/stores/totalMaintenanceStore";
import { useTotalNettoyageStore } from "@/stores/totalNettoyageStore";
import { useTotalOfficeManagerStore } from "@/stores/totalOfficeManagerStore";
import { useTotalServicesFm4AllStore } from "@/stores/totalServicesFm4AllStore";
import { useTotalSnacksFruitsStore } from "@/stores/totalSnacksFruitsStore";
import { useTotalStore } from "@/stores/totalStore";
import { useTotalTheStore } from "@/stores/totalTheStore";
import { createMesLocauxSchema, MesLocauxType } from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { fullReinitialisationDevis } from "./fullReinitialisationDevis";
import { reinitialisationDevis } from "./reinitialisationDevis";
import ServicesLoader from "./ServicesLoader";

const MesLocaux = () => {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  const tDevisButton = useTranslations("devisButton");
  const tErrors = useTranslations("DevisPage.locaux.locauxForm.erreurs");
  const [loading, setLoading] = useState(false);
  const { devisProgress, setDevisProgress } = useDevisProgressStore((s) => ({
    devisProgress: s.devisProgress,
    setDevisProgress: s.setDevisProgress,
  }));
  const setServices = useServicesStore((s) => s.setServices);
  const setFoodBeverage = useFoodBeverageStore((s) => s.setFoodBeverage);
  const setManagement = useManagementStore((s) => s.setManagement);
  const setPersonnalisation = usePersonnalisationStore(
    (s) => s.setPersonnalisation,
  );
  const setMonDevis = useMonDevisStore((s) => s.setMonDevis);
  const { client, setClient } = useClientStore((s) => ({
    client: s.client,
    setClient: s.setClient,
  }));
  const { setNettoyage } = useNettoyageStore();
  const setHygiene = useHygieneStore((s) => s.setHygiene);
  const setMaintenance = useMaintenanceStore((s) => s.setMaintenance);
  const setIncendie = useIncendieStore((s) => s.setIncendie);
  const setCafe = useCafeStore((s) => s.setCafe);
  const setThe = useTheStore((s) => s.setThe);
  const setTotalThe = useTotalTheStore((s) => s.setTotalThe);
  const setSnacksFruits = useSnacksFruitsStore((s) => s.setSnacksFruits);
  const setFontaines = useFontainesStore((s) => s.setFontaines);
  const setOfficeManager = useOfficeManagerStore((s) => s.setOfficeManager);
  const setServicesFm4All = useServicesFm4AllStore((s) => s.setServicesFm4All);
  const setCommentaires = useCommentairesStore((s) => s.setCommentaires);
  const setTotalNettoyage = useTotalNettoyageStore((s) => s.setTotalNettoyage);
  const setTotalHygiene = useTotalHygieneStore((s) => s.setTotalHygiene);
  const setTotalIncendie = useTotalIncendieStore((s) => s.setTotalIncendie);
  const setTotalMaintenance = useTotalMaintenanceStore(
    (s) => s.setTotalMaintenance,
  );
  const setTotalCafe = useTotalCafeStore((s) => s.setTotalCafe);
  const setTotalSnacksFruits = useTotalSnacksFruitsStore(
    (s) => s.setTotalSnacksFruits,
  );
  const setTotalFontaines = useTotalFontainesStore((s) => s.setTotalFontaines);
  const setTotalOfficeManager = useTotalOfficeManagerStore(
    (s) => s.setTotalOfficeManager,
  );
  const setTotalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.setTotalServicesFm4All,
  );
  const setTotal = useTotalStore((s) => s.setTotal);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(true);

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
  const devisRoutes: {
    id: number;
    pathname:
      | "/locaux"
      | "/services"
      | "/food-beverage"
      | "/pilotage"
      | "/sauvegarder"
      | "/personnaliser"
      | "/afficher";
    searchParams?: URLSearchParams;
    name: string;
  }[] = [
    {
      id: 1,
      pathname: "/locaux",
      name: "Mes locaux",
    },
    {
      id: 2,
      pathname: "/services",
      searchParams: serviceSearchParams,
      name: "Mes services",
    },
    {
      id: 3,
      pathname: "/food-beverage",
      name: "Food & Beverage",
    },
    {
      id: 4,
      pathname: "/pilotage",
      searchParams: serviceSearchParams,
      name: "Office Management",
    },
    {
      id: 5,
      pathname: "/sauvegarder",
      searchParams: sauvegarderSearchParams,
      name: "Sauvegarder",
    },
    {
      id: 6,
      pathname: "/personnaliser",
      name: "Personnaliser",
    },
    {
      id: 7,
      pathname: "/afficher",
      name: "Afficher mon devis",
    },
  ];

  const defaultValues: MesLocauxType = {
    surface: client.surface,
    effectif: client.effectif,
    typeBatiment: client.typeBatiment,
    typeOccupation: client.typeOccupation,
    codePostal: "",
  };

  const form = useForm<MesLocauxType>({
    mode: "all",
    resolver: zodResolver(
      createMesLocauxSchema({
        surface: tErrors("surface"),
        effectif: tErrors("effectif"),
        batiment: tErrors("batiment"),
        occupation: tErrors("occupation"),
        codePostal: tErrors("codePostal"),
      }),
    ),
    defaultValues,
  });

  const submitForm = async (data: MesLocauxType) => {
    const dataToPost = {
      ...data,
      ville: "",
    };

    setLoading(true);
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${dataToPost.codePostal}`,
      );
      const cityData = await response.json();

      if (cityData.length === 0) {
        setDevisProgress({ ...devisProgress, completedSteps: [] });
        toast({
          variant: "destructive",
          title: t("code-postal-invalide"),
          description: t(
            "le-code-postal-ne-correspond-a-aucune-ville-veullez-reessayer",
          ),
        });
        setLoading(false);
        return;
      }
      dataToPost.ville = cityData[0].nom;
      setClient({
        ...client,
        ...dataToPost,
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
    //Departement in ou out
    if (
      !departements.find(
        ({ id }) => id === dataToPost.codePostal?.substring(0, 2),
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
      });
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
      data.surface,
      data.effectif,
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
      setTotal,
    );
    setLoaderVisible(true);
    window.scrollTo(0, 0);
    const serviceSearchParams = new URLSearchParams();
    serviceSearchParams.set("effectif", dataToPost.effectif.toString());
    serviceSearchParams.set("surface", dataToPost.surface.toString());
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

  // const handleSelect = (value: string, name: string) => {
  //   setClient((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

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
      setTotal,
    );
    form.reset(defaultValues);
    setShowModal(false);
  };
  const handleClickReprendre = () => {
    const route =
      devisRoutes.find(({ id }) => id === devisProgress.currentStep) ??
      devisRoutes[0];

    router.push({
      pathname: `/devis${route.pathname}`,
      query: route.searchParams
        ? Object.fromEntries(route.searchParams.entries())
        : {},
    });
    setShowModal(false);
  };

  if (!loaderVisible && devisProgress.completedSteps.includes(1))
    return (
      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent
          className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{tDevisButton("devis-en-cours")}</DialogTitle>
            <DialogDescription>
              {tDevisButton(
                "un-devis-est-deja-en-cours-souhaitez-vous-le-reprendre-ou-en-creer-un-nouveau-vos-informations-seront-perdues",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="mx-auto flex justify-center gap-4">
              <Button variant="destructive" onClick={handleClickNouveau}>
                {tDevisButton("nouveau")}
              </Button>
              <Button onClick={handleClickReprendre} variant="outline">
                {tDevisButton("reprendre")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return !loaderVisible ? (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="mx-auto mt-6 flex w-full flex-col gap-14 p-1 md:mt-10 md:w-2/3"
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("code-postal")}
              nameInSchema="codePostal"
              placeholder="XXXXX"
              data-testid="code-postal-input"
              autoFocus
              // handleChange={handleChange}
            />
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("surface-en-m")}
              nameInSchema="surface"
              type="number"
              min={50}
              max={MAX_SURFACE}
              data-testid="surface-input"
              // handleChange={handleChange}
            />
            <InputWithLabel<MesLocauxType>
              fieldTitle={t("nombre-moyen-de-personnes")}
              nameInSchema="effectif"
              type="number"
              min={1}
              max={MAX_EFFECTIF}
              data-testid="effectif-input"
              // handleChange={handleChange}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <SelectWithLabel<MesLocauxType>
              fieldTitle={t("type-de-batiment")}
              nameInSchema="typeBatiment"
              data={batiments}
              // handleSelect={handleSelect}
              data-testid="type-batiment-select"
              translationPrefix="DevisPage.locaux.locauxForm.batiments"
            />
            <SelectWithLabel<MesLocauxType>
              fieldTitle={t("type-doccupation")}
              nameInSchema="typeOccupation"
              data={occupation}
              // handleSelect={handleSelect}
              data-testId="type-occupation-select"
              translationPrefix="DevisPage.locaux.locauxForm.occupation"
            />
          </div>
        </div>
        {/* {devisProgress.completedSteps.includes(1) ? (
          <Dialog>
            <DialogTrigger asChild ref={dialogRef}>
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

            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{tDevisButton("devis-en-cours")}</DialogTitle>
                <DialogDescription>
                  {t(
                    "un-devis-est-deja-en-cours-souaitez-vous-recommencer-un-nouveau-devis-vos-informations-actuelles-seront-perdues",
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <div className="mx-auto flex justify-center gap-4">
                    <Button
                      variant="destructive"
                      onClick={() => form.handleSubmit(submitForm)()}
                    >
                      {tDevisButton("nouveau")}
                    </Button>
                    {/* <Button variant="outline" onClick={handleClickReprendre}>
                      Reprendre
                    </Button> */}
        {/* <Button variant="outline">{t("annuler")}</Button>
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}
        {/* ) : ( } */}
        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="lg"
            title={t("afficher-les-tarifs")}
            className="text-base"
            disabled={loading}
            data-testid="afficher-tarifs-button"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              t("afficher-les-tarifs")
            )}
          </Button>
        </div>
        {/* // )} */}
      </form>
    </Form>
  ) : (
    <ServicesLoader />
  );
};
export default MesLocaux;
