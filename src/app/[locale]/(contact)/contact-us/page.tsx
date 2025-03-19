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
    title: "Contact us",
    description:
      "Contact us for questions about our facility management services",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/contact-us`,
      languages: {
        en: "https://www.fm4all.com/en/contact-us",
        fr: "https://www.fm4all.com/fr/contactez-nous",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "en" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <ContactPage />;
};

export default page;
