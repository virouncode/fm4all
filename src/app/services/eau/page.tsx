import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Eau",
  description: "Découvrez notre sélection de fontaines à eau.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Fontaine à eau</h1>
        <p className="text-xl">
          Eau filtrée, fraîche, gazeuse, à poser ou encastrer, il y a forcément
          un modèle fait pour vous.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"/img/services/fontaines.png"}
            alt="illustration-fontaine-a-eau"
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
