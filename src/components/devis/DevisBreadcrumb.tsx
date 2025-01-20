"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
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
  const { cafe } = useContext(CafeContext);

  const serviceSearchParams = new URLSearchParams();
  const foodBeverageSearchParams = new URLSearchParams();

  if (client.effectif) {
    serviceSearchParams.set(
      "effectif",
      roundEffectif(client.effectif).toString()
    );
    foodBeverageSearchParams.set(
      "effectif",
      roundEffectif(client.effectif).toString()
    );
  }
  if (client.surface) {
    serviceSearchParams.set("surface", roundSurface(client.surface).toString());
  }

  if (cafe.cafeFournisseurId) {
    foodBeverageSearchParams.set(
      "cafeFournisseurId",
      cafe.cafeFournisseurId.toString()
    );
  }

  //mes-services searchParams : surface, effectif, fournisseurId, nettoyageGamme
  //food-beverage searchParams : cafeFournisseurId, effectif

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
      url: `/food-beverage?${foodBeverageSearchParams.toString()}`,
      name: "Food & Beverage",
    },
    {
      id: 4,
      url: "/sauvegarder-ma-progression",
      name: "Sauvegarder ma progression",
    },
    {
      id: 5,
      url: "/personnaliser-mon-devis",
      name: "Personnaliser mon devis",
    },
    {
      id: 6,
      url: "/afficher-mon-devis",
      name: "Afficher mon devis",
    },
  ];
  return (
    <div className="flex justify-center">
      <Breadcrumb className="h-20 md:h-10">
        <BreadcrumbList className="text-sm lg:text-base">
          {devisRoutes.map((route, index) => (
            <div key={route.id} className="flex gap-3 items-center">
              <BreadcrumbItem className="flex items-center">
                {route.id === devisProgress.currentStep ? (
                  <BreadcrumbPage className="font-bold">
                    {route.name}
                  </BreadcrumbPage>
                ) : (
                  <Link
                    onClick={() => {
                      setDevisProgress((prev) => ({
                        ...prev,
                        currentStep: route.id,
                      }));
                    }}
                    href={`/mon-devis${route.url}`}
                    className={`${
                      devisProgress.completedSteps.includes(route.id) ||
                      route.id ===
                        devisProgress.completedSteps[
                          devisProgress.completedSteps.length - 1
                        ] +
                          1
                        ? ""
                        : "pointer-events-none"
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
  );
};

export default DevisBreadcrumb;

//Si j'ai complété les étapes d'avant je suis cliquable
