"use client";

import { Button } from "@/components/ui/button";
import { ClientContext } from "@/context/ClientProvider";
import { DateTime } from "luxon";
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
            Il est <strong>valable 15 jours</strong> et nous engage. Imaginez le{" "}
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
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="text-base flex items-center justify-center w-full"
            asChild
          >
            <Link
              href="https://calendly.com/romuald-fm4all/rdv-fm4all"
              target="_blank"
            >
              Je prends un rendez-vous en visio
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base flex items-center justify-center w-full"
            asChild
          >
            <Link href="tel:+33669311046">Je contacte par téléphone</Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base flex items-center justify-center w-full"
            asChild
          >
            <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 w-full mx-auto max-w-prose items-center">
          <a
            href={devisUrl}
            download={`Devis_fm4all_${DateTime.local().toFormat(
              "dd-MM-yyyy'T'HH:mm"
            )}.pdf`}
            className="underline"
          >
            Télécharger le devis
          </a>
          <p>
            Si le document ne s&apos;affiche pas correctement :{" "}
            <Link href={devisUrl} target="_blank" className="underline">
              Cliquez ici
            </Link>
          </p>
        </div>
        <div className="w-full mt-6 mb-6 flex justify-center">
          <embed src={devisUrl} className="w-full h-screen" />
        </div>
        <div className="flex flex-col gap-4 mx-auto  items-center hyphens-auto text-wrap">
          <p className="max-w-prose">Vous avez des questions ?</p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full flex items-center justify-center"
              asChild
            >
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous en visio
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonDevisDocument;
