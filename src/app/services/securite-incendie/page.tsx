import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Securité incendie",
  description:
    "BAES, éxtincteurs, détecteurs de fumée, alarme incendie, laissez nos experts vérifier vos installations.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Sécurité incendie</h1>
        <p className="text-xl">
          BAES, éxtincteurs, détecteurs de fumée, alarme incendie, laissez nos
          experts vérifier vos installations.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-securite-incendie"
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
