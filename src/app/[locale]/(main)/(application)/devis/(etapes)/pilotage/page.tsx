import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import DevisGuard from "../../DevisGuard";
import ServicesLoader from "../locaux/ServicesLoader";
import PilotagePrestations from "./PilotagePrestations";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generatePageMetadata(
    "pilotageDevis",
    locale,
    locale === "fr" ? "Pilotage Prestations" : "Service Management",
    locale === "fr"
      ? "Etape 4 du devis: pourquoi pas un office manager dans vos locaux ?"
      : "Quote Step 4: why not have an office manager in your premises?",
  );
};

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: LocaleType }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DevisPage");
  const tPilotage = await getTranslations("DevisPage.pilotage");
  const { surface, effectif } = await searchParams;
  if (!surface || !effectif) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {t("vous-devez-d-abord-remplir-les-informations-sur-vos")}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("vos-locaux")}
          </Link>
          .
        </p>
      </section>
    );
  }
  if (
    isNaN(parseInt(surface as string)) ||
    isNaN(parseInt(effectif as string))
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {t(
            "les-valeurs-de-surface-et-effectif-renseignees-ne-sont-pas-valides",
          )}{" "}
          <Link href="/devis/locaux" className="underline">
            {t("veuillez-reessayer")}
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl">
          {tPilotage("4-pilotage-prestations")}
        </h1>
      </div>
      <DevisGuard>
        <Suspense fallback={<ServicesLoader />}>
          <PilotagePrestations surface={surface} effectif={effectif} />
        </Suspense>
      </DevisGuard>
    </>
  );
};

export default page;
