"use client";
import { Button } from "@/components/ui/button";
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
  const { devisProgress } = useContext(DevisProgressContext);
  const { client } = useContext(ClientContext);
  const { nettoyage } = useContext(NettoyageContext);
  const serviceSearchParams = new URLSearchParams();
  console.log("clientContext", client);

  if (client.effectif) {
    serviceSearchParams.set(
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
  const url = devisProgress.currentStep
    ? devisRoutes.find(({ id }) => id === devisProgress.currentStep)?.url ??
      "/mes-locaux"
    : "/mes-locaux";
  return (
    <Button
      title={title}
      variant="destructive"
      size={size}
      className={`w-full md:w-auto text-base ${className}`}
    >
      <Link href={`/mon-devis${url}`}>{text}</Link>
      {/* Mon devis en ligne */}
    </Button>
  );
};

export default DevisButton;
