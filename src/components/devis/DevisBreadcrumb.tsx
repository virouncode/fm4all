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
import { roundSurface } from "@/lib/roundSurface";
import Link from "next/link";
import { useContext } from "react";
import { roundEffectif } from "../../lib/roundEffectif";

//Pour naviguer dans le Funnel de devis
//Il faut que le client ait rempli les étapes précédentes pour pouvoir cliquer sur l'étape suivante
//Quand on clique sur une étape il faut renvoyer vers l'url avec les search params correspondants

const DevisBreadcrumb = () => {
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

  const devisRoutes = [
    {
      id: 1,
      url: "/mes-locaux",
      name: "1. Mes locaux",
    },
    {
      id: 2,
      url: `/mes-services?${serviceSearchParams.toString()}`,
      name: "2. Services",
    },
    {
      id: 3,
      url: `/food-beverage`,
      name: "3. Food/Beverage",
    },
    {
      id: 4,
      url: `/pilotage-prestations?${serviceSearchParams.toString()}`,
      name: "4. Pilotage",
    },
    {
      id: 5,
      url: `/sauvegarder-ma-progression?${sauvegarderSearchParams.toString()}`,
      name: "5. Sauvegarder",
    },
    {
      id: 6,
      url: "/personnaliser-mon-devis",
      name: "6. Personnaliser",
    },
    {
      id: 7,
      url: "/afficher-mon-devis",
      name: "7. Mon Devis",
    },
  ];

  const handleClickBreadcrumbLink = (route: {
    id: number;
    url: string;
    name: string;
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
                      {route.name}
                    </BreadcrumbPage>
                  ) : (
                    <Link
                      onClick={() => handleClickBreadcrumbLink(route)}
                      href={`/mon-devis${route.url}`}
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
                      {route.name}
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
              href={`/mon-devis${previousRoute.url}`}
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
              &lt; {previousRoute.name}
            </Link>
          ) : null}
        </div>
        <div>
          {nextRoute ? (
            <Link
              onClick={() => handleClickBreadcrumbLink(nextRoute)}
              href={`/mon-devis${nextRoute.url}`}
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
              {nextRoute.name} &gt;
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DevisBreadcrumb;

//Si j'ai complété les étapes d'avant je suis cliquable
