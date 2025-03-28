import CTAContactButtons from "@/components/cta-contact-buttons";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Contactez-nous pour des questions sur nos services de facility managment",
};

const page = async () => {
  const t = await getTranslations("ContactPage");
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
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
