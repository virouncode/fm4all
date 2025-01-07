"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import Link from "next/link";
import { useContext } from "react";

const devisRoutes = [
  {
    id: 1,
    url: "/mes-locaux",
    name: "Mes locaux",
  },
  {
    id: 2,
    url: "/mes-services",
    name: "Mes services",
  },
  { id: 3, url: "/food-beverage", name: "Food & Beverage" },
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

type DevisBreadcumbProps = {
  currentStepId: number;
};

const DevisBreadcrumb = ({ currentStepId }: DevisBreadcumbProps) => {
  const { devisProgress } = useContext(DevisProgressContext);

  return (
    <div className="flex justify-center">
      <Breadcrumb className="h-20 md:h-10">
        <BreadcrumbList className="text-sm lg:text-base">
          {devisRoutes.map((route, index) => (
            <div key={route.id} className="flex gap-3 items-center">
              <BreadcrumbItem className="flex items-center">
                {route.id === currentStepId ? (
                  <BreadcrumbPage className="font-bold">
                    {route.name}
                  </BreadcrumbPage>
                ) : (
                  // isClient && (
                  <Link
                    href={`/mon-devis${route.url}`}
                    className={`${
                      devisProgress.completedSteps[
                        devisProgress.completedSteps.length - 1
                      ] !==
                        route.id - 1 && route.id !== 1
                        ? "pointer-events-none"
                        : ""
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
