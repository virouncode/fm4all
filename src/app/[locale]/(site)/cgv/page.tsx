import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
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
      : "Read our sales terms and conditions to learn more about our purchasing and payment policies."
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CGVPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("conditions-generales-de-vente-cgv")}</h1>
        <div className="flex flex-col gap-4 w-full mx-auto max-w-prose items-center">
          <p>
            {t("si-le-document-ne-s-affiche-pas-correctement")}{" "}
            <Link
              href={
                locale === "fr"
                  ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250416-PHvyk70HWFDxvKTw2rRTjD513c0Rws.pdf"
                  : "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/T%26C%27s%20fm4all%2020250416-AHdw5e3gXVc4wUvfHb0HhwYbJoC6Tt.pdf"
              }
              target="_blank"
              className="underline"
            >
              {t("cliquez-ici")}
            </Link>
          </p>
        </div>
        <div className="w-full mt-6 mb-6">
          <iframe
            src={
              locale === "fr"
                ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250416-PHvyk70HWFDxvKTw2rRTjD513c0Rws.pdf"
                : "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/T%26C%27s%20fm4all%2020250416-AHdw5e3gXVc4wUvfHb0HhwYbJoC6Tt.pdf"
            }
            className="w-full h-screen"
          />
        </div>
      </section>
    </main>
  );
};

export default page;
