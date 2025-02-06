import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Café",
  description: "Découvrez notre sélection de cafés et thés.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Café</h1>
        <p className="text-xl">
          Blend robusta, Arabica de spécialité, cappuccino noisette ou thé bio ?
          Il y en a pour tous les goûts et budgets.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"/img/services/cafe.png"}
            alt="illustration-café"
            quality={100}
            className="w-full h-full object-cover"
            fill={true}
          />
        </div>
      </section>
    </main>
  );
};

export default page;
