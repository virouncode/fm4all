"use client";

import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { ClientContext } from "@/context/ClientProvider";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useContext } from "react";

type MonDevisDocumentProps = {
  devisUrl: string;
};

const MonDevisDocument = ({ devisUrl }: MonDevisDocumentProps) => {
  const t = useTranslations("DevisPage.afficher");
  const { client } = useContext(ClientContext);

  return (
    <div className="flex flex-col gap-6 h-full overflow-auto" id="2">
      <p className="text-lg font-bold max-w-prose mx-auto">
        {client.prenomContact} {client.nomContact},
      </p>
      <div className="flex-1 flex flex-col items-center gap-6 overflow-auto">
        <div className="flex flex-col gap-4 mx-auto max-w-prose items-center hyphens-auto text-wrap">
          <p>
            {t("votre-devis-complet-et-personnalise-vous-attend-ci-dessous")}
          </p>
          <p>
            {t("il-est")} <strong>{t("valable-15-jours")}</strong>{" "}
            {t("et-nous-engage-imaginez-le")}{" "}
            <strong>{t("temps-que-vous-avez-gagne")}</strong>{" "}
            {t("par-rapport-a-un-appel-doffres-traditionnel")}
          </p>
          <p>
            {t(
              "ce-devis-vous-convient-gagnez-encore-du-temps-en-nous-laissant-rediger-pour-vous-les-cahiers-des-charges-et-le-contrat-final-afin-de-demarrer-au-plus-vite"
            )}
          </p>
          <p>
            <strong>{t("pour-donner-suite")}</strong> :
          </p>
        </div>
        <CTAContactButtons />
        <div className="flex flex-col gap-4 w-full mx-auto max-w-prose items-center">
          <a
            href={devisUrl}
            download={`Devis_fm4all_${DateTime.local().toFormat(
              "dd-MM-yyyy'T'HH:mm"
            )}.pdf`}
            className="underline"
          >
            {t("telecharger-le-devis")}
          </a>
          <p>
            {t("si-le-document-ne-saffiche-pas-correctement")}{" "}
            <Link href={devisUrl} target="_blank" className="underline">
              {t("cliquez-ici")}
            </Link>
          </p>
        </div>
        <div className="w-full mt-6 mb-6 flex justify-center">
          <iframe src={devisUrl} className="w-full h-screen" />
        </div>
      </div>
    </div>
  );
};

export default MonDevisDocument;
