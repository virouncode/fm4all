import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "contact",
    locale,
    locale === "fr" ? "Nous contacter" : "Contact us",
    locale === "fr"
      ? "Contactez-nous pour des questions sur nos services de facility managment"
      : "Contact us for questions about our facility management services"
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <div style={{ fontSize: "10px", color: "#ccc" }}>
        {" "}
        Generated at: {new Date().toISOString()}
      </div>
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("nous-contacter")}</h1>
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto hyphens-auto text-wrap items-center">
          <p>{t("des-questions-sur-nos-services-ou-nos-offres-en-general")}</p>
          <p>{t("nous-sommes-la")}</p>
        </div>
        <CTAContactButtons />
        <div className="flex items-center justify-center w-full">
          <p className="text-base text-center">
            {t("romuald-buffe-dirigeant-fm4all")}
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
