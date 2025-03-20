import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import FaqPage from "../FaqPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "faq",
    locale,
    "Foire aux questions",
    "Foire aux questions sur les services de fm4All"
  );
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <FaqPage />;
};

export default page;
