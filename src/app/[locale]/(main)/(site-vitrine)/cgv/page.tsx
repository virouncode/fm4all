import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "cgv",
    locale,
    locale === "fr"
      ? "Conditions Générales de Vente (CGV)"
      : "Sales Terms and Conditions",
    locale === "fr"
      ? "Lisez nos conditions générales de vente (CGV) pour en savoir plus sur les règles d'achat et de paiement."
      : "Read our sales terms and conditions to learn more about our purchasing and payment policies.",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CGVPage");
  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("conditions-generales-de-vente-cgv")}</h1>
        <div className="mx-auto flex w-full max-w-prose flex-col items-center gap-4">
          <p>
            {t("si-le-document-ne-s-affiche-pas-correctement")}{" "}
            <a
              href={
                locale === "fr"
                  ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250416-3cWd57xG84FTKBYBot6WEpJQrZjE1J.pdf"
                  : "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/Terms%20and%20conditions%20%28CGV%20EN%29%2020250416-7v7RF6gJkp9PazUE7xhTunF93J1sea.pdf"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {t("cliquez-ici")}
            </a>
          </p>
        </div>
        <div className="mt-6 mb-6 w-full">
          <iframe
            src={
              locale === "fr"
                ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250416-3cWd57xG84FTKBYBot6WEpJQrZjE1J.pdf"
                : "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/Terms%20and%20conditions%20%28CGV%20EN%29%2020250416-7v7RF6gJkp9PazUE7xhTunF93J1sea.pdf"
            }
            className="h-screen w-full"
          />
        </div>
      </section>
    </main>
  );
};

export default page;
