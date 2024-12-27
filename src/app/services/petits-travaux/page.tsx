import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Petits travaux",
  description:
    "Plomberie, électricité, peinture, second oeuvre, confiez vos petits travaux récurrents à un prestataire de confiance.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Petits travaux</h1>
        <p className="text-xl">
          Plomberie, électricité, peinture, second oeuvre, confiez vos petits
          travaux récurrents à un prestataire de confiance.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-petits-travaux"
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
