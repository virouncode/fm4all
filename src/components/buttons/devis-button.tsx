"use client";
import { fullReinitialisationDevis } from "@/app/[locale]/(main)/(application)/devis/(etapes)/locaux/fullReinitialisationDevis";
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
import CafeProvider, { CafeContext } from "@/context/CafeProvider";
import ClientProvider, { ClientContext } from "@/context/ClientProvider";
import CommentairesProvider, {
  CommentairesContext,
} from "@/context/CommentairesProvider";
import DevisProgressProvider, {
  DevisProgressContext,
} from "@/context/DevisProgressProvider";
import FontainesProvider, {
  FontainesContext,
} from "@/context/FontainesProvider";
import FoodBeverageProvider, {
  FoodBeverageContext,
} from "@/context/FoodBeverageProvider";
import HygieneProvider, { HygieneContext } from "@/context/HygieneProvider";
import IncendieProvider, { IncendieContext } from "@/context/IncendieProvider";
import MaintenanceProvider, {
  MaintenanceContext,
} from "@/context/MaintenanceProvider";
import ManagementProvider, {
  ManagementContext,
} from "@/context/ManagementProvider";
import MonDevisProvider, { MonDevisContext } from "@/context/MonDevisProvider";
import NettoyageProvider, {
  NettoyageContext,
} from "@/context/NettoyageProvider";
import OfficeManagerProvider, {
  OfficeManagerContext,
} from "@/context/OfficeManagerProvider";
import PersonnalisationProvider, {
  PersonnalisationContext,
} from "@/context/PersonnalisationProvider";
import ServicesFm4AllProvider, {
  ServicesFm4AllContext,
} from "@/context/ServicesFm4AllProvider";
import ServicesProvider, { ServicesContext } from "@/context/ServicesProvider";
import SnacksFruitsProvider, {
  SnacksFruitsContext,
} from "@/context/SnacksFruitsProvider";
import TheProvider, { TheContext } from "@/context/TheProvider";
import TotalCafeProvider, {
  TotalCafeContext,
} from "@/context/TotalCafeProvider";
import TotalFontainesProvider, {
  TotalFontainesContext,
} from "@/context/TotalFontainesProvider";
import TotalHygieneProvider, {
  TotalHygieneContext,
} from "@/context/TotalHygieneProvider";
import TotalIncendieProvider, {
  TotalIncendieContext,
} from "@/context/TotalIncendieProvider";
import TotalMaintenanceProvider, {
  TotalMaintenanceContext,
} from "@/context/TotalMaintenanceProvider";
import TotalNettoyageProvider, {
  TotalNettoyageContext,
} from "@/context/TotalNettoyageProvider";
import TotalOfficeManagerProvider, {
  TotalOfficeManagerContext,
} from "@/context/TotalOfficeManagerProvider";
import TotalProvider, { TotalContext } from "@/context/TotalProvider";
import TotalServicesFm4AllProvider, {
  TotalServicesFm4AllContext,
} from "@/context/TotalServicesFm4AllProvider";
import TotalSnacksFruitsProvider, {
  TotalSnacksFruitsContext,
} from "@/context/TotalSnacksFruitsProvider";
import TotalTheProvider, { TotalTheContext } from "@/context/TotalTheProvider";
import { useRouter } from "@/i18n/navigation";
import { ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useContext } from "react";

type DevisButtonProps = {
  title: string;
  text: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
  setIsMobileNavOpen?: Dispatch<SetStateAction<boolean>>;
  withIcon?: boolean;
};

const DevisButton = ({
  title,
  text,
  className,
  size = "default",
  withIcon = true,
  setIsMobileNavOpen,
}: DevisButtonProps) => {
  const t = useTranslations("devisButton");
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
      setTotal,
    );
    if (setIsMobileNavOpen) setIsMobileNavOpen(false);
    router.push("/devis/locaux");
  };

  return (
    <DevisProgressProvider>
      <ClientProvider>
        <ServicesProvider>
          <PersonnalisationProvider>
            <MonDevisProvider>
              <NettoyageProvider>
                <HygieneProvider>
                  <IncendieProvider>
                    <MaintenanceProvider>
                      <FoodBeverageProvider>
                        <CafeProvider>
                          <TheProvider>
                            <SnacksFruitsProvider>
                              <FontainesProvider>
                                <ManagementProvider>
                                  <OfficeManagerProvider>
                                    <ServicesFm4AllProvider>
                                      <CommentairesProvider>
                                        <TotalProvider>
                                          <TotalNettoyageProvider>
                                            <TotalHygieneProvider>
                                              <TotalIncendieProvider>
                                                <TotalMaintenanceProvider>
                                                  <TotalCafeProvider>
                                                    <TotalTheProvider>
                                                      <TotalSnacksFruitsProvider>
                                                        <TotalFontainesProvider>
                                                          <TotalOfficeManagerProvider>
                                                            <TotalServicesFm4AllProvider>
                                                              {devisProgress.completedSteps.includes(
                                                                1,
                                                              ) ? (
                                                                <Dialog>
                                                                  <DialogTrigger
                                                                    asChild
                                                                  >
                                                                    <Button
                                                                      type="button"
                                                                      variant="destructive"
                                                                      size={
                                                                        size
                                                                      }
                                                                      title={
                                                                        text
                                                                      }
                                                                      className={`ring-destructive text-base shadow-md ring-2 ring-offset-2 transition-all hover:scale-[101%] hover:shadow-lg ${className}`}
                                                                      onClick={
                                                                        setIsMobileNavOpen
                                                                          ? () =>
                                                                              setIsMobileNavOpen(
                                                                                false,
                                                                              )
                                                                          : undefined
                                                                      }
                                                                    >
                                                                      {withIcon && (
                                                                        <ReceiptText className="hidden sm:inline" />
                                                                      )}{" "}
                                                                      {text}
                                                                    </Button>
                                                                  </DialogTrigger>
                                                                  <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                                                                    <DialogHeader>
                                                                      <DialogTitle>
                                                                        {t(
                                                                          "devis-en-cours",
                                                                        )}
                                                                      </DialogTitle>
                                                                      <DialogDescription>
                                                                        {t(
                                                                          "un-devis-est-deja-en-cours-souhaitez-vous-le-reprendre-ou-en-creer-un-nouveau-vos-informations-seront-perdues",
                                                                        )}
                                                                      </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                      <DialogClose
                                                                        asChild
                                                                      >
                                                                        <div className="mx-auto flex justify-center gap-4">
                                                                          <Button
                                                                            variant="destructive"
                                                                            onClick={
                                                                              handleClickNouveau
                                                                            }
                                                                          >
                                                                            {t(
                                                                              "nouveau",
                                                                            )}
                                                                          </Button>
                                                                          <Button
                                                                            onClick={
                                                                              handleClickReprendre
                                                                            }
                                                                            variant="outline"
                                                                          >
                                                                            {t(
                                                                              "reprendre",
                                                                            )}
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
                                                                    title={
                                                                      title
                                                                    }
                                                                    className={`ring-destructive text-base shadow-md ring-2 ring-offset-2 transition-all hover:scale-[101%] hover:shadow-lg ${className}`}
                                                                    onClick={
                                                                      handleClickNouveau
                                                                    }
                                                                    data-testid="devis-button"
                                                                  >
                                                                    {withIcon && (
                                                                      <ReceiptText className="hidden sm:inline" />
                                                                    )}{" "}
                                                                    {text}
                                                                  </Button>
                                                                </div>
                                                              )}
                                                            </TotalServicesFm4AllProvider>
                                                          </TotalOfficeManagerProvider>
                                                        </TotalFontainesProvider>
                                                      </TotalSnacksFruitsProvider>
                                                    </TotalTheProvider>
                                                  </TotalCafeProvider>
                                                </TotalMaintenanceProvider>
                                              </TotalIncendieProvider>
                                            </TotalHygieneProvider>
                                          </TotalNettoyageProvider>
                                        </TotalProvider>
                                      </CommentairesProvider>
                                    </ServicesFm4AllProvider>
                                  </OfficeManagerProvider>
                                </ManagementProvider>
                              </FontainesProvider>
                            </SnacksFruitsProvider>
                          </TheProvider>
                        </CafeProvider>
                      </FoodBeverageProvider>
                    </MaintenanceProvider>
                  </IncendieProvider>
                </HygieneProvider>
              </NettoyageProvider>
            </MonDevisProvider>
          </PersonnalisationProvider>
        </ServicesProvider>
      </ClientProvider>
    </DevisProgressProvider>
  );
};

export default DevisButton;
