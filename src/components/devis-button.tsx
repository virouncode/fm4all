"use client";
import { Button } from "@/components/ui/button";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundSurface } from "@/lib/roundSurface";
import Link from "next/link";
import { useContext } from "react";

type DevisButtonProps = {
  title: string;
  text: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
};

const DevisButton = ({
  title,
  text,
  className,
  size = "default",
}: DevisButtonProps) => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { client } = useContext(ClientContext);
  const { nettoyage } = useContext(NettoyageContext);
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

  if (nettoyage.gammeSelected) {
    serviceSearchParams.set("nettoyageGamme", nettoyage.gammeSelected);
  }
  if (nettoyage.fournisseurId) {
    serviceSearchParams.set(
      "fournisseurId",
      nettoyage.fournisseurId.toString()
    );
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

  const route = devisProgress.currentStep
    ? devisRoutes.find(({ id }) => id === devisProgress.currentStep) ??
      devisRoutes[0]
    : devisRoutes[0];
  const url = route.url;
  return (
    <Button
      title={title}
      variant="destructive"
      size={size}
      className={`w-full md:w-auto text-base ${className}`}
    >
      <Link
        href={`/mon-devis${url}`}
        onClick={() => {
          setDevisProgress((prev) => ({
            ...prev,
            currentStep: route.id,
          }));
        }}
      >
        {text}
      </Link>
      {/* Mon devis en ligne */}
    </Button>
  );
};

export default DevisButton;
