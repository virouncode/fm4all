import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";
import { Suspense } from "react";
import DevisGuard from "../../DevisGuard";
import ServicesLoader from "../locaux/ServicesLoader";
import MesServices from "./MesServices";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "servicesDevis",
    locale,
    locale === "fr" ? "Mes services" : "My services",
    locale === "fr"
      ? "Etape 2 du devis : choisissez vos services"
      : "Quote Step 2: Choose your services",
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
  const tServices = await getTranslations("DevisPage.services");
  const { surface, effectif } = await searchParams;

  if (!surface || !effectif) {
    notFound();
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
        <h1 className="text-3xl md:text-4xl">{tServices("2-mes-services")}</h1>
      </div>
      <DevisGuard>
        <Suspense fallback={<ServicesLoader />}>
          <MesServices surface={surface} effectif={effectif} />
        </Suspense>
      </DevisGuard>
    </>
  );
};

export default page;
