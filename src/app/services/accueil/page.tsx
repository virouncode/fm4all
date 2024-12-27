import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Accueil",
  description: "Mettez en place un accueil physique qui vous ressemble.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Accueil</h1>
        <p className="text-xl">
          Vous recevez des clients ou des visiteurs ? Mettez en place un accueil
          physique qui vous ressemble.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-accueil"
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
