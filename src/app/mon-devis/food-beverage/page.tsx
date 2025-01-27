import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import FoodBeverage from "./FoodBeverage";

export const metadata: Metadata = {
  title: "Food & Beverage",
  description:
    "Etape 3 du devis: optez pour des boissons chaudes, des fruits et des snacks sains et gourmands",
};

const page = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Food & Beverage</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <FoodBeverage />
      </Suspense>
    </>
  );
};

export default page;
