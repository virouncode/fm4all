import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CityOutPage from "../CityOutPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "chalandise",
    locale,
    "City not eligible",
    "Our automatic pricing matrix is currently being developed for your region."
  );
};

export const generateStaticParams = () => {
  return [{ locale: "en" }];
};

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { locale } = await params;
  const { destination } = await searchParams;
  setStaticParamsLocale(locale);
  return <CityOutPage destination={destination} />;
};

export default page;
