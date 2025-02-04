"use client";

import { Button } from "@/components/ui/button";
import { ClientContext } from "@/context/ClientProvider";
import Link from "next/link";
import { useContext } from "react";

type MonDevisDocumentProps = {
  devisUrl: string;
};

const MonDevisDocument = ({ devisUrl }: MonDevisDocumentProps) => {
  const { client } = useContext(ClientContext);

  return (
    <div className="flex flex-col gap-6 h-full overflow-auto" id="2">
      <p className="text-lg font-bold max-w-prose mx-auto">
        {client.prenomContact} {client.nomContact},
      </p>
      <div className="flex-1 flex flex-col items-center gap-6 overflow-auto">
        <div className="flex flex-col gap-4 mx-auto max-w-prose items-center hyphens-auto text-wrap">
          <p>Votre devis complet et personnalisé vous attend ci-dessous.</p>
          <p>
            Il est <strong>valable 7 jours</strong> et nous engage. Imaginez le{" "}
            <strong>temps que vous avez gagné</strong> par rapport à un appel
            d’offres traditionnel !
          </p>
          <p>
            Ce devis vous convient ? Gagnez encore du temps en nous laissant
            rédiger pour vous les cahiers des charges et le contrat final afin
            de démarrer au plus vite.
          </p>
          <p>
            <strong>Pour donner suite</strong> :
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button variant="destructive" size="lg" className="text-base">
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous visio
              </Link>
            </Button>
            <Button variant="destructive" size="lg" className="text-base">
              Je contacte par téléphone le{" "}
              <Link href="tel:+33669311046">+33 6 69 31 10 46</Link>
            </Button>
            <Button variant="destructive" size="lg" className="text-base">
              <Link href="mailto:devis@fm4all.com">
                Je renvoie mon devis signé
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full mt-6 mb-6">
          <iframe src={devisUrl} className="w-full h-screen" />
        </div>
        <div className="flex flex-col gap-4 mx-auto max-w-prose items-center hyphens-auto text-wrap">
          <p>Vous avez des questions ?</p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button variant="destructive" size="lg" className="text-base">
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous visio
              </Link>
            </Button>
            <Button variant="destructive" size="lg" className="text-base">
              Je contacte par téléphone le{" "}
              <Link href="tel:+33669311046">+33 6 69 31 10 46</Link>
            </Button>
            <Button variant="destructive" size="lg" className="text-base">
              <Link href="mailto:devis@fm4all.com">
                Je renvoie mon devis signé
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonDevisDocument;
