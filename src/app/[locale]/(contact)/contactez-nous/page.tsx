import ContactPage from "@/app/[locale]/(contact)/ContactPage";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Contactez-nous",
    description:
      "Contactez-nous pour plus de questions sur nos services de Facility Management",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/contactez-nous`,
      languages: {
        en: "https://www.fm4all.com/en/contact-us",
        fr: "https://www.fm4all.com/fr/contactez-nous",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <ContactPage />;
};

export default page;
