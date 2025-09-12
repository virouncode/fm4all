"use client";

import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import Link from "next/link";

type MonDevisDocumentProps = {
  devisUrl: string;
};

const MonDevisDocument = ({ devisUrl }: MonDevisDocumentProps) => {
  const t = useTranslations("DevisPage.afficher");
  const client = useClientStore((s) => s.client);

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto" id="2">
      <p className="mx-auto max-w-prose text-lg font-bold">
        {client.prenomContact} {client.nomContact},
      </p>
      <div className="flex flex-1 flex-col items-center gap-6 overflow-auto">
        <div className="mx-auto flex max-w-prose flex-col items-center gap-4 text-wrap hyphens-auto">
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
              "ce-devis-vous-convient-gagnez-encore-du-temps-en-nous-laissant-rediger-pour-vous-les-cahiers-des-charges-et-le-contrat-final-afin-de-demarrer-au-plus-vite",
            )}
          </p>
          <p>
            <strong>{t("pour-donner-suite")}</strong> :
          </p>
        </div>
        <CTAContactButtons />
        <div className="mx-auto flex w-full max-w-prose flex-col items-center gap-4">
          <a
            href={devisUrl}
            download={`Devis_fm4all_${DateTime.local().toFormat(
              "dd-MM-yyyy'T'HH:mm",
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
        <div className="mt-6 mb-6 flex w-full justify-center">
          <iframe src={devisUrl} className="h-screen w-full" />
        </div>
      </div>
    </div>
  );
};

export default MonDevisDocument;
