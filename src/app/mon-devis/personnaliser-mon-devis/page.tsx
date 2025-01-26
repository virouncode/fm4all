import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import PersonnaliserDevis from "./PersonnaliserDevis";

const page = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Mes services</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <PersonnaliserDevis />
      </Suspense>
    </>
  );
};

export default page;
