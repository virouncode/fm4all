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
    "Frequently Asked Questions",
    "Frequently asked questions about fm4All services"
  );
};

export const generateStaticParams = () => {
  return [{ locale: "en" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <FaqPage />;
};

export default page;
