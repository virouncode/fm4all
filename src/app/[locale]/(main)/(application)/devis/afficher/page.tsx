import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import MonDevis from "./MonDevis";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "monDevis",
    locale,
    locale === "fr" ? "Mon devis" : "My quote",
    locale === "fr"
      ? "Dernière étape du devis: bravo ! Vous avez personnalisé votre devis, il ne vous reste plus qu'à l'afficher"
      : "Quote Final Step: Congratulations! You have customized your quote, now you just need to display it",
  );
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tAfficher = await getTranslations("DevisPage.afficher");
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl">{tAfficher("7-mon-devis")}</h1>
      </div>
      <MonDevis />
    </>
  );
};

export default page;
