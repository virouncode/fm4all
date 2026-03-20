import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import MesLocaux from "./MesLocaux";

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
    "locauxDevis",
    locale,
    locale === "fr" ? "Mes locaux" : "My premises",
    locale === "fr"
      ? "Etape 1 du devis: Mes locaux. 5 informations seulement pour obtenir tous vos devis"
      : "Quote Step 1: My premises. Only 5 pieces of information to get all your quotes",
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DevisPage.locaux");

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl">{t("1-mes-locaux")}</h1>
        <p className="text-center text-lg">
          {t("5-informations-seulement-pour-obtenir-tous-vos-devis")}
        </p>
      </div>
      <section className="flex h-full flex-1 flex-col gap-10 overflow-auto">
        <MesLocaux />
      </section>
    </>
  );
};

export default page;
