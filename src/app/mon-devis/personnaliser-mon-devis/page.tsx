import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import PersonnaliserDevis from "./PersonnaliserDevis";

export const metadata: Metadata = {
  title: "Personnaliser",
  description: "Etape 6 du devis: personnaliser votre devis",
};

const page = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Personnaliser mon devis</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <PersonnaliserDevis />
      </Suspense>
    </>
  );
};

export default page;
