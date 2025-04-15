import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import MesLocaux from "./MesLocaux";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "locauxDevis",
    locale,
    locale === "fr" ? "Mes locaux" : "My premises",
    locale === "fr"
      ? "Etape 1 du devis: Mes locaux. 5 informations seulement pour obtenir tous vos devis"
      : "Quote Step 1: My premises. Only 5 pieces of information to get all your quotes"
  );
};

const page = async () => {
  const t = await getTranslations("DevisPage.locaux");
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl">{t("1-mes-locaux")}</h1>
        <p className="text-lg text-center">
          {t("5-informations-seulement-pour-obtenir-tous-vos-devis")}
        </p>
      </div>
      <section className="flex flex-col gap-10 h-full flex-1 overflow-auto">
        <MesLocaux />
      </section>
    </>
  );
};

export default page;
