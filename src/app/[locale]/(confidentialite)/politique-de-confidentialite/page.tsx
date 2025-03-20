import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import ConfidentialitePage from "../ConfidentialitePage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "confidentialite",
    locale,
    "Politique de confidentialité",
    "Lisez notre politique de confidentialité pour en savoir plus sur la collecte et le traitement de vos données personnelles."
  );
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <ConfidentialitePage />;
};

export default page;
