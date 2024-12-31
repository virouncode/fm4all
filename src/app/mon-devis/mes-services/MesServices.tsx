"use client";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import Link from "next/link";
import { useContext } from "react";

const MesServices = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { devisData, setDevisData } = useContext(DevisDataContext);
  console.log("devisData", devisData);

  if (!devisProgress.completedSteps.includes(1)) {
    return (
      <div className="text-lg mx-auto max-w-prose mt-10">
        Vous devez d&apos;abord remplir les informations sur vos{" "}
        <Link href="/mon-devis/mes-locaux" className="underline">
          locaux
        </Link>
      </div>
    );
  }

  return <div>Mes services</div>;
};

export default MesServices;
