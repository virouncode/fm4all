import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import SauvegarderProgression from "./SauvegarderProgression";

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
    "sauverDevis",
    locale,
    locale === "fr" ? "Sauvegarder ma progression" : "Save my progress",
    locale === "fr"
      ? "Etape 5 du devis: sauvegarder votre progression"
      : "Quote Step 5: save your progress",
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
  const tSauver = await getTranslations("DevisPage.sauver");
  const { surface, effectif, typeBatiment, typeOccupation } =
    await searchParams;

  if (!surface || !effectif || !typeBatiment || !typeOccupation) {
    notFound();
  }
  if (
    !["bureaux", "localCommercial", "entrepot", "cabinetMedical"].includes(
      typeBatiment,
    ) ||
    !["partieEtage", "plateauComplet", "batimentEntier"].includes(
      typeOccupation,
    )
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          {tSauver(
            "les-informations-sur-votre-type-de-batiment-ou-doccupation-ne-sont-pas-valides",
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
          {tSauver("5-sauvegarder-ma-progression")}
        </h1>
      </div>
      <SauvegarderProgression />
    </>
  );
};

export default page;
