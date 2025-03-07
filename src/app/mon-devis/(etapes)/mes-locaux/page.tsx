import { Metadata } from "next";
import MesLocaux from "./MesLocaux";

export const metadata: Metadata = {
  title: "Mes locaux",
  description:
    "Etape 1 du devis: Mes locaux. 5 informations seulement pour obtenir tous vos devis",
};

const page = () => {
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl">1. Mes locaux</h1>
        <p className="text-lg text-center">
          5 informations seulement pour obtenir tous vos devis
        </p>
      </div>
      <section className="flex flex-col gap-10 h-full flex-1 overflow-auto">
        <MesLocaux />
      </section>
    </>
  );
};

export default page;
