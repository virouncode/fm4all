import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CgvPage from "../CgvPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "cgv",
    locale,
    "Conditions Générales de Vente (CGV)",
    "Lisez nos conditions générales de vente (CGV) pour en savoir plus sur les règles d'achat et de paiement"
  );
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <CgvPage />;
};

export default page;
