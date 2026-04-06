import { LocaleType } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DevisGuard from "../DevisGuard";
import MonDevis from "./MonDevis";

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
    "monDevis",
    locale,
    locale === "fr" ? "Mon devis" : "My quote",
    locale === "fr"
      ? "Dernière étape du devis: bravo ! Vous avez personnalisé votre devis, il ne vous reste plus qu'à l'afficher"
      : "Quote Final Step: Congratulations! You have customized your quote, now you just need to display it",
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tAfficher = await getTranslations("DevisPage.afficher");
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl">{tAfficher("7-mon-devis")}</h1>
      </div>
      <DevisGuard>
        <MonDevis />
      </DevisGuard>
    </>
  );
};

export default page;
