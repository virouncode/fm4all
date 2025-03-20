import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CguPage from "../CguPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "cgu",
    locale,
    "Conditions Générales d'Utilisation (CGU)",
    "Lisez nos conditions générales d'utilisation (CGU) pour en savoir plus sur les règles d'accès et d'utilisation de notre site."
  );
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <CguPage />;
};

export default page;
