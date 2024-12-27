import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Agent de sécurité",
  description: "Télésurveillance ou présence sur site",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Agent de sécurité</h1>
        <p className="text-xl">
          Télésurveillance ou présence sur site, nos partenaires protègent vos
          installations.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-agent-de-securite"
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
