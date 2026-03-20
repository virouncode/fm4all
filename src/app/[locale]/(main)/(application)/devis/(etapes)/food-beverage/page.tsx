import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import DevisGuard from "../../DevisGuard";
import ServicesLoader from "../locaux/ServicesLoader";
import FoodBeverage from "./FoodBeverage";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "foodDevis",
    locale,
    "Food & Beverage",
    locale === "fr"
      ? "Etape 3 du devis: optez pour des boissons chaudes, des fruits et des snacks sains et gourmands"
      : "Quote Step 3: choose from hot drinks, fruits, and healthy, delicious snacks.",
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl">3. Food & Beverage</h1>
      </div>
      <DevisGuard>
        <Suspense fallback={<ServicesLoader />}>
          <FoodBeverage />
        </Suspense>
      </DevisGuard>
    </>
  );
};

export default page;
