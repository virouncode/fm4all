"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { ManagementContext } from "@/context/ManagementProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { Link } from "@/i18n/navigation";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundSurface } from "@/lib/roundSurface";
import { useLocale } from "next-intl";
import { useContext } from "react";

//Pour naviguer dans le Funnel de devis
//Il faut que le client ait rempli les étapes précédentes pour pouvoir cliquer sur l'étape suivante
//Quand on clique sur une étape il faut renvoyer vers l'url avec les search params correspondants

const DevisBreadcrumb = () => {
  const locale = useLocale() as "fr" | "en";
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { client } = useContext(ClientContext);
  const { setServices } = useContext(ServicesContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setManagement } = useContext(ManagementContext);
  const { setPersonnalisation } = useContext(PersonnalisationContext);

  const serviceSearchParams = new URLSearchParams();
  const sauvegarderSearchParams = new URLSearchParams();

  if (client.effectif) {
    serviceSearchParams.set(
      "effectif",
      roundEffectif(client.effectif).toString()
    );
    sauvegarderSearchParams.set(
      "effectif",
      roundEffectif(client.effectif).toString()
    );
  }
  if (client.surface) {
    serviceSearchParams.set("surface", roundSurface(client.surface).toString());
    sauvegarderSearchParams.set(
      "surface",
      roundSurface(client.surface).toString()
    );
  }
  if (client.typeBatiment) {
    sauvegarderSearchParams.set("typeBatiment", client.typeBatiment);
  }
  if (client.typeOccupation) {
    sauvegarderSearchParams.set("typeOccupation", client.typeOccupation);
  }

  //mes-services searchParams : surface, effectif, fournisseurId, nettoyageGamme

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
    name: {
      fr: string;
      en: string;
    };
  }[] = [
    {
      id: 1,
      pathname: "/locaux",
      name: {
        fr: "1. Mes locaux",
        en: "1. My premises",
      },
    },
    {
      id: 2,
      pathname: "/services",
      name: {
        fr: "2. Services",
        en: "2. Services",
      },
      searchParams: serviceSearchParams,
    },
    {
      id: 3,
      pathname: `/food-beverage`,
      name: { fr: "3. Food/Beverage", en: "3. Food/Beverage" },
    },
    {
      id: 4,
      pathname: `/pilotage`,
      name: { fr: "4. Pilotage", en: "4. Management" },
      searchParams: serviceSearchParams,
    },
    {
      id: 5,
      pathname: `/sauvegarder`,
      name: { fr: "5. Sauvegarder", en: "5. Save" },
      searchParams: sauvegarderSearchParams,
    },
    {
      id: 6,
      pathname: "/personnaliser",
      name: { fr: "6. Personnaliser", en: "6. Customize" },
    },
    {
      id: 7,
      pathname: "/afficher",
      name: { fr: "7. Mon Devis", en: "7. My Quote" },
    },
  ];

  const handleClickBreadcrumbLink = (route: {
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
    name: {
      fr: string;
      en: string;
    };
  }) => {
    setDevisProgress((prev) => ({
      ...prev,
      currentStep: route.id,
    }));
    if (route.id === 2)
      setServices((prev) => ({ ...prev, currentServiceId: 1 }));
    if (route.id === 3)
      setFoodBeverage((prev) => ({ ...prev, currentFoodBeverageId: 1 }));
    if (route.id === 4)
      setManagement((prev) => ({ ...prev, currentManagementId: 1 }));
    if (route.id === 6)
      setPersonnalisation((prev) => ({
        ...prev,
        currentPersonnalisationId: 1,
      }));
  };

  const previousRoute = devisRoutes.find(
    ({ id }) => id === devisProgress.currentStep - 1
  );
  const nextRoute = devisRoutes.find(
    ({ id }) => id === devisProgress.currentStep + 1
  );

  return (
    <>
      <div className="justify-center hidden lg:flex">
        <Breadcrumb className="h-20 md:h-10 overflow-auto">
          <BreadcrumbList className="text-sm lg:text-base">
            {devisRoutes.map((route, index) => (
              <div key={route.id} className="flex gap-2 items-center">
                <BreadcrumbItem className="flex items-center">
                  {route.id === devisProgress.currentStep ? (
                    <BreadcrumbPage className="font-bold hover:opacity-80">
                      {route.name[locale]}
                    </BreadcrumbPage>
                  ) : (
                    <Link
                      onClick={() => handleClickBreadcrumbLink(route)}
                      href={{
                        pathname: `/devis${route.pathname}`,
                        query: route.searchParams
                          ? Object.fromEntries(route.searchParams.entries())
                          : {},
                      }}
                      className={`hover:opacity-80 ${
                        devisProgress.completedSteps.includes(route.id) ||
                        route.id ===
                          devisProgress.completedSteps[
                            devisProgress.completedSteps.length - 1
                          ] +
                            1
                          ? ""
                          : "pointer-events-none opacity-40"
                      }`}
                    >
                      {route.name[locale]}
                    </Link>
                    // )
                  )}
                </BreadcrumbItem>
                {index < devisRoutes.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="justify-between flex lg:hidden sticky -mt-4 top-[65px] bg-white z-20 py-4 border-slate-200 border-b">
        <div>
          {previousRoute ? (
            <Link
              onClick={() => handleClickBreadcrumbLink(previousRoute)}
              href={{
                pathname: `/devis${previousRoute.pathname}`,
                query: previousRoute.searchParams
                  ? Object.fromEntries(previousRoute.searchParams.entries())
                  : {},
              }}
              className={`hover:opacity-80 ${
                devisProgress.completedSteps.includes(previousRoute.id) ||
                previousRoute.id ===
                  devisProgress.completedSteps[
                    devisProgress.completedSteps.length - 1
                  ] +
                    1
                  ? ""
                  : "pointer-events-none opacity-40"
              }`}
            >
              &lt; {previousRoute.name[locale]}
            </Link>
          ) : null}
        </div>
        <div>
          {nextRoute ? (
            <Link
              onClick={() => handleClickBreadcrumbLink(nextRoute)}
              href={{
                pathname: `/devis${nextRoute.pathname}`,
                query: nextRoute.searchParams
                  ? Object.fromEntries(nextRoute.searchParams.entries())
                  : {},
              }}
              className={`hover:opacity-80 ${
                devisProgress.completedSteps.includes(nextRoute.id) ||
                nextRoute.id ===
                  devisProgress.completedSteps[
                    devisProgress.completedSteps.length - 1
                  ] +
                    1
                  ? ""
                  : "pointer-events-none opacity-40"
              }`}
            >
              {nextRoute.name[locale]} &gt;
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DevisBreadcrumb;

//Si j'ai complété les étapes d'avant je suis cliquable
