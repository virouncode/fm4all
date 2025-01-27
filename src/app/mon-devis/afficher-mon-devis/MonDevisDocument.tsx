"use client";

import { ClientContext } from "@/context/ClientProvider";
import { useContext } from "react";
import PreviousServiceButton from "../PreviousServiceButton";
import { MonDevisContext } from "@/context/MonDevisProvider";

const MonDevisDocument = () => {
  const { client } = useContext(ClientContext);
  const { setMonDevis } = useContext(MonDevisContext);
  const handleClickPrevious = () => {
    setMonDevis({ currentMonDevisId: 1 });
  };
  return (
    <div className="flex flex-col gap-6 h-full" id="2">
      <div className="flex justify-end">
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>

      <p className="text-lg font-bold max-w-prose mx-auto">
        {client.prenomContact} {client.nomContact},
      </p>
      <div className="flex flex-col gap-4 mx-auto max-w-prose items-center hyphens-auto">
        <p>Votre devis complet et personnalisé vous attend ci-dessous.</p>
        <p>
          Il est <strong>valable 7 jours</strong> et nous engage. Faire votre
          devis avec fm4all vous aura demandé quelques minutes. Imaginez le{" "}
          <strong>temps que vous avez gagné</strong> par rapport à un appel
          d’offres traditionnel !
        </p>
        <p>
          Nous vous proposons de vous faire encore gagner du temps en rédigeant
          pour vous les cahiers des charges et le contrat final.
        </p>
      </div>
    </div>
  );
};

export default MonDevisDocument;
