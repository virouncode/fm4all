import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import ServicesLoader from "../locaux/ServicesLoader";
import FoodBeverage from "./FoodBeverage";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "foodDevis",
    locale,
    "Food & Beverage",
    locale === "fr"
      ? "Etape 3 du devis: optez pour des boissons chaudes, des fruits et des snacks sains et gourmands"
      : "Quote Step 3: choose from hot drinks, fruits, and healthy, delicious snacks."
  );
};

const page = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">3. Food & Beverage</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <FoodBeverage />
      </Suspense>
    </>
  );
};

export default page;
