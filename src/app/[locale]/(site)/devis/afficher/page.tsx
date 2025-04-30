import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import MonDevis from "./MonDevis";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "monDevis",
    locale,
    locale === "fr" ? "Mon devis" : "My quote",
    locale === "fr"
      ? "Dernière étape du devis: bravo ! Vous avez personnalisé votre devis, il ne vous reste plus qu'à l'afficher"
      : "Quote Final Step: Congratulations! You have customized your quote, now you just need to display it"
  );
};

const page = async () => {
  const tAfficher = await getTranslations("DevisPage.afficher");
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">{tAfficher("7-mon-devis")}</h1>
      </div>
      <MonDevis />
    </>
  );
};

export default page;
